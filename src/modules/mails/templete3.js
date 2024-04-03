export let template3 =(token)=>{
    return `<!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Reset</title>
      <style>
          body {
              font-family: Arial, sans-serif;
              background-color: #f4f4f4;
              margin: 0;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
          }
  
          form {
              background-color: #fff;
              padding: 20px;
              border-radius: 8px;
              box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
              width: 300px;
          }
  
          label {
              display: block;
              margin-bottom: 10px;
          }
  
          input {
              width: 100%;
              padding: 8px;
              margin-bottom: 15px;
              box-sizing: border-box;
          }
  
          button {
              background-color: #4caf50;
              color: #fff;
              padding: 10px;
              border: none;
              border-radius: 4px;
              cursor: pointer;
              width: 100%;
          }
  
          button:hover {
              background-color: #45a049;
          }
          @media only screen and (min-width: 768px) {
              form {
                  width: 400px;
              }
          }
      </style>
  </head>
  <body>
      <form action="/users/reset-password/${token}" method="post">
          <label for="password">New Password:</label>
          <input type="password" id="password" name="password" required>
          <button type="submit">Reset Password</button>
      </form>
  </body>
  </html>
  `
  }