import { userModel } from "../../../databases/modeles/user.js";
import { catchAsyncError } from "../../middleware/catchAsyncError.js";
import { AppError } from "../../utils/AppError.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { sendToEmail } from "../mails/sendEmail.js";
import { htmlResetPassword } from "../mails/templete2.js";
import { template4 } from "../mails/templete4.js";
import { template3 } from "../mails/templete3.js";
import { createTransport } from "nodemailer";
import UserStatus from "../../../databases/modeles/status.js";
import mongoose from "mongoose";
import Record from "../../../databases/modeles/record.js";

const signUp = catchAsyncError(async (req, res, next) => {
  const gmail = await userModel.findOne({ email: req.body.email });
  // if (gmail) return next(new AppError("Account Already Exist", 403));

  if (req.file) {
    req.body.imgCover = req.file.filename;
  }
  req.body.fullname = req.body.firstname + " " + req.body.lastname;
  const user = new userModel(req.body);
  await user.save();
  sendToEmail({ email: req.body.email });
  res.json({ message: "success", user });
});

const signIn = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;
  const user = await userModel.findOne({ email });
  // console.log(user);
  if (!user) return next(new AppError("Account Not Found", 401));
  if (!(await bcrypt.compare(password, user.password)))
    return next(new AppError("Password Wrong", 403));

  // if (!user.confrimEmail)

  // return next(new AppError("Please Verfiy Your Email and Login Again"));
  // console.log(confirmEmail);
  let token = jwt.sign(
    {
      email: user.email,
      userId: user._id,
      firstname: user.firstname,
      lastname: user.lastname,
      fullname: user.fullname,
    },
    "moracp57"
  );
  res.json({ message: "success", user, token });
});

const verfiyEmail = catchAsyncError(async (req, res, next) => {
  const { token } = req.params;
  jwt.verify(token, "email123456", async function (err, decoded) {
    if (err) return next(new AppError("Not Verfiy Token"));
    await userModel.findOneAndUpdate(
      { email: decoded.email },
      { confrimEmail: true }
    );
    res.status(200).send(template4());
  });
});
const sendToEmailAgain = catchAsyncError(async (req, res, next) => {
  const { email } = req.body;
  const user = await userModel.findOne({ email });
  if (user && !user.confrimEmail) {
    await sendToEmail({ email: req.body.email });
    res.json({ message: "Success And Check In Your Email" });
  } else {
    next(new AppError("Check In Your Data", 403));
  }
});

const updateDate = catchAsyncError(async (req, res, next) => {
  if (req.body.firstname || req.body.lastname) {
    req.body.fullname =
      (req.body.firstname || req.user.firstname) +
      " " +
      (req.body.lastname || req.user.lastname);
  }
  if (req.file) {
    req.body.imgCover = req.file.filename;
  }
  const user = await userModel.findById(req.user._id);
  if (!user) return next(new AppError("Not Valid Email", 403));
  const newUpdate = await userModel.findByIdAndUpdate(req.user, req.body, {
    new: true,
  });
  res.json({ message: "success", newUpdate });
});
const changePassword = catchAsyncError(async (req, res, next) => {
  const { newPassword, oldPassword } = req.body;
  const user = await userModel.findById(req.user._id);
  if (!user) return next(new AppError("Not Valid Email", 403));
  if (!oldPassword) return next(new AppError("please Enter Old Password", 403));
  if (!(await bcrypt.compare(oldPassword, user.password)))
    return next(new AppError("Password That You Enter is Wrong"));
  const newUpdate = await userModel.findByIdAndUpdate(
    req.user,
    { password: newPassword },
    { new: true }
  );
  res.json({ message: "success", newUpdate });
});

const getUser = catchAsyncError(async (req, res, next) => {
  const user = await userModel.findById(req.user._id);
  if (!user) return next(new AppError("User Not Found", 403));
  res.json({ message: "success", user });
});

const logout = catchAsyncError(async (req, res, next) => {
  req.body.logout = Date.now();
  const user = await userModel.findByIdAndUpdate(req.user._id, req.body, {
    new: true,
  });
  res.json({ message: "success", user });
});

const removeAccount = catchAsyncError(async (req, res, next) => {
  const user = await userModel.findByIdAndDelete(req.user._id);
  res.json({ message: "Account Deleted ." });
});
let forgetPassword = catchAsyncError(async (req, res) => {
  const { email } = req.body;
  const user = await userModel.findOne({ email });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // // Generate a random token
  // const token = crypto.randomBytes(20).toString('hex');
  // user.resetToken = token;
  let token = jwt.sign({ email: email }, "resetPassword");
  // Create a Nodemailer transporter
  const transporter = createTransport({
    service: "outlook",
    auth: {
      user: "mohamedahmed893@outlook.com",
      pass: "mo7$@4321",
    },
  });

  // Send password reset email
  const mailOptions = {
    from: '"Mohamed 👻" <mohamedahmed893@outlook.com>',
    to: email,
    subject: "Password Reset ✔",
    html: htmlResetPassword(token),
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return res.status(500).json({ message: "Error sending email" + error });
    }
    res.status(200).json({ message: "Password reset email sent" });
  });
});

let changeResetPassword = catchAsyncError(async (req, res) => {
  const { token } = req.params;
  res.send(template3(token));
});

let resetPassword = catchAsyncError(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  jwt.verify(token, "resetPassword", async (err, decode) => {
    if (err) return res.json({ message: err });

    let user = await userModel.findOne({ email: decode.email });
    if (!user) {
      return res.status(404).json({ message: "Email Not Found" });
    }
    // Update the user's password and clear the resetToken
    await userModel.findOneAndUpdate(
      { email: decode.email },
      { password },
      { new: true }
    );
    res.status(200).send(template4());
  });
});
//////////////////////////////////////////////////
// Log user status
const logStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const userId = req.user._id;
    const userStatus = await UserStatus.create({ userId, status });
    res.status(200).send("Status logged successfully." + userStatus);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error logging status.");
  }
};
//get user status
const getSingleUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const getUserStatus = await UserStatus.findById(userId);
    res.status(200).json(getUserStatus);
  } catch (error) {
    console.log(error.message);
  }
};

// Get status count for a user in a given time period (week, month, year)



const getStatusCount = async (req, res) => {
  try {
    const { userId, duration } = req.params;
    const endDate = new Date();
    let startDate;

    switch (duration) {
      case "day":
        startDate = new Date(endDate.getTime() - 1 * 24 * 60 * 60 * 1000);
        break;
      case "week":
        startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "month":
        startDate = new Date(endDate.getFullYear(), endDate.getMonth() - 1, endDate.getDate());
        break;
      case "year":
        startDate = new Date(endDate.getFullYear() - 1, endDate.getMonth(), endDate.getDate());
        break;
      default:
        return res.status(400).send("Invalid duration.");
    }

    const statusCounts = await UserStatus.aggregate([
      {
        $match: {
          userId: userId, createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const countResult = {
      userId,
      duration,
      statusCounts,
    };

    res.status(200).json(countResult);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error retrieving status count.");
  }
};
////////////////////////////////////////////////////////////

//results
function results() {

  const words = ["happey", "sad", "surprised"]

  const randomNumber = Math.floor(math.random() * words.length)
  console.log(words[randomNumber])

}
// 1. تسجيل المشاعر
const enterRecord = catchAsyncError(async (req, res) => {

  // const userId = req.user._id;
  const userId = req.user._id;

  const emotion = 'happy'
  results(randomNumber)
  // const emotion = req.body;

  // قم بتسجيل المشاعر في قاعدة البيانات مع تاريخ الريكورد
  // const record = new Record({ userId, emotion, date: new Date() });
  const record = new Record({ userId, randomNumber, date: new Date() });
  await record.save();

  res.status(200).send('تم تسجيل المشاعر بنجاح');
})

/////////////////////////////////

const getHistoryDay = catchAsyncError(async (req, res) => {


  const userId = req.user._id;

  // حساب بداية اليوم الحالي
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const emotions = await Record.aggregate([
    {
      $match: {
        userId,
        date: { $gte: startOfDay },
      },
    },
    {
      $group: {
        _id: '$emotion',
        count: { $sum: 1 },
      },
    },
  ]);
  const dailyData = { happy: 0, sad: 0, surprised: 0 };
  emotions.forEach((emotion) => {
    dailyData[emotion._id] = emotion.count;
  });

  res.status(200).json({ Day: dailyData });

})
////////////////////////////////week
// const getHistoryWeek = catchAsyncError(async (req, res) => {

//   const userId = req.user._id;

//   const startOfWeek = new Date();
//   startOfWeek.setHours(0, 0, 0, 0);
//   startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

//   const weeklyData = {};

//   for (let i = 0; i < 7; i++) {
//     const currentDate = new Date(startOfWeek);
//     currentDate.setDate(startOfWeek.getDate() + i);

//     const emotions = await Record.aggregate([
//       {
//         $match: {
//           userId,
//           date: { $gte: currentDate, $lt: new Date(currentDate.getTime() + 86400000) },
//         },
//       },
//       {
//         $group: {
//           _id: '$emotion',
//           count: { $sum: 1 },
//         },
//       },
//     ]);

//     const dailyData = {
//       happy: 0,
//       sad: 0,
//       surprised: 0,
//     };

//     emotions.forEach((emotion) => {
//       dailyData[emotion._id] = emotion.count;
//     });

//     weeklyData[currentDate.toLocaleDateString('en-US', { weekday: 'long' })] = dailyData;
//   }

//   res.status(200).json({ Week: weeklyData });
// });

////////////////////////////////////////////////
const getHistoryWeek = catchAsyncError(async (req, res) => {

  const userId = req.user._id;

  const startOfWeek = new Date();
  startOfWeek.setHours(0, 0, 0, 0);
  startOfWeek.setDate(startOfWeek.getDate() - (startOfWeek.getDay() + 1) % 7);


  const weeklyData = {};

  for (let i = 0; i < 7; i++) {

    const currentDate = new Date(startOfWeek);
    currentDate.setDate(startOfWeek.getDate() + i);

    const emotions = await Record.aggregate([
      {
        $match: {
          userId,
          date: { $gte: currentDate, $lt: new Date(currentDate.getTime() + 86400000) },
        },
      },
      {
        $group: {
          _id: '$emotion',
          count: { $sum: 1 },
        },
      },
    ]);

    const dailyData = {
      happy: 0,
      sad: 0,
      surprised: 0,
    };

    emotions.forEach((emotion) => {
      dailyData[emotion._id] = emotion.count;
    });

    weeklyData[currentDate.toLocaleDateString('en-US', { weekday: 'long' })] = dailyData;
  }

  res.status(200).json({ Week: weeklyData });
});
//////////////////////////////////////////////////////
const getHistoryMonth = catchAsyncError(async (req, res) => {

  const userId = req.user._id;

  const currentDate = new Date();
  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  startOfMonth.setHours(0, 0, 0, 0);

  const monthlyData = {};

  for (let i = 0; i < 4; i++) {
    const startOfWeek = new Date(startOfMonth);
    startOfWeek.setDate(startOfMonth.getDate() + i * 7);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);
    endOfWeek.setHours(23, 59, 59, 999);

    const emotions = await Record.aggregate([
      {
        $match: {
          userId,
          date: {
            $gte: startOfWeek,
            $lt: endOfWeek,
          },
        },
      },
      {
        $group: {
          _id: '$emotion',
          count: { $sum: 1 },
        },
      },
    ]);

    const weeklyData = {
      happy: 0,
      sad: 0,
      surprised: 0,
    };

    emotions.forEach((emotion) => {
      weeklyData[emotion._id] = emotion.count;
    });

    monthlyData[`Week ${i + 1}`] = weeklyData;
  }

  res.status(200).json({ Month: monthlyData });
});
/////////////////////////////////////////////////////////yearlyData
const getHistoryYear = catchAsyncError(async (req, res) => {

  const userId = req.user._id;

  const startOfYear = new Date();
  startOfYear.setMonth(0, 1);
  startOfYear.setHours(0, 0, 0, 0);

  const yearlyData = {};

  for (let i = 0; i < 12; i++) {
    const currentMonth = new Date(startOfYear);
    currentMonth.setMonth(startOfYear.getMonth() + i);

    const emotions = await Record.aggregate([
      {
        $match: {
          userId,
          date: {
            $gte: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1),
            $lt: new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0, 23, 59, 59),
          },
        },
      },
      {
        $group: {
          _id: '$emotion',
          count: { $sum: 1 },
        },
      },
    ]);

    const monthlyData = {
      happy: 0,
      sad: 0,
      surprised: 0,
    };

    emotions.forEach((emotion) => {
      monthlyData[emotion._id] = emotion.count;
    });

    yearlyData[currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })] = monthlyData;
  }

  res.status(200).json({ Year: yearlyData });
});
////////////////////////////////////////////////////////////////////year 3 months
const getHistoryYearpart = catchAsyncError(async (req, res) => {


  const userId = req.user._id;


  const currentDate = new Date();
  const startOfYear = new Date(currentDate.getFullYear(), 0, 1);
  startOfYear.setHours(0, 0, 0, 0);

  const yearlyData = {};

  for (let i = 0; i < 4; i++) {
    const startOfQuarter = new Date(startOfYear);
    startOfQuarter.setMonth(i * 3);

    const endOfQuarter = new Date(startOfQuarter);
    endOfQuarter.setMonth(startOfQuarter.getMonth() + 3);
    endOfQuarter.setDate(endOfQuarter.getDate() - 1);
    endOfQuarter.setHours(23, 59, 59, 999);

    const emotions = await Record.aggregate([
      {
        $match: {
          userId,
          date: {
            $gte: startOfQuarter,
            $lte: endOfQuarter,
          },
        },
      },
      {
        $group: {
          _id: '$emotion',
          count: { $sum: 1 },
        },
      },
    ]);

    const quarterlyData = {
      happy: 0,
      sad: 0,
      surprised: 0,
    };

    emotions.forEach((emotion) => {
      quarterlyData[emotion._id] = emotion.count;
    });

    yearlyData[`Quarter ${i + 1}`] = quarterlyData;
  }

  res.status(200).json({ Year: yearlyData });
});
///////////////////////////////////////////////////
export {
  signUp,
  signIn,
  verfiyEmail,
  updateDate,
  changePassword,
  getUser,
  logout,
  removeAccount,
  sendToEmailAgain,
  resetPassword,
  changeResetPassword,
  forgetPassword,
  logStatus,
  getStatusCount,
  getSingleUserStatus,
  getHistoryDay,
  getHistoryWeek,
  getHistoryMonth,
  getHistoryYear,
  getHistoryYearpart,
  enterRecord
};
