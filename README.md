# SmartSensor_M2C

Model to code tool for the SmartSensor profile

## ChatGPT&copy; Usage

Part of this project is based on the examples provided by ChatGPT&copy;. Especifically, it provided examples for the [initial template](#initial-project-template).

### Initial project template

This part required two prompts:

1. ```
    You are a software developer writing a simple NodeJS web application in Node 18 using the ExpressJS framework. It is a model to code transformation tool in a model-driven development process. The purpose of the NodeJS web application is to allow users to upload an XMI file from a simple but stylized page, parse the XMI file into a JSON object, generate the code from the object, and provide the user a compressed folder with the code to download. The NodeJS web application must provide the page that allows the selection and upload of the file, and the server that receives the file, transforms it, and returns the downloadable compressed folder.

    Your tasks as a software developer are:
    1 - Provide the NodeJS web application main HTML page with its CSS to upload the file and download the compressed folder.
    2 - Provide the NodeJS web application main JavaScript file using the ExpressJS framework that starts the server, provides the main HTML page from the <GET /home> path, and allows to receive the uploaded XMI file from the <POST /file> path. The <POST /file> path must parse the XMI file into a JSON object, save it as a file into a folder with a unique ID in the server, compress the folder, and return it for download.
    ```

2. ```
    Make these improvements:

   1. Give the browse file button a matching style in the HTML and CSS.
   2. Check that the first 'output' folder exists before creating the `output/${uniqueId}` folder. Create the first 'output' folder if necessary.
   3. Chech that only .xmi files are allowed to load in the application.
    ```