# SmartSensor_M2C

Model to code tool for the SmartSensor profile

***Contents***
- [SmartSensor\_M2C](#smartsensor_m2c)
  - [Tool Usage](#tool-usage)
    - [Setup](#setup)
    - [Regular Use](#regular-use)
  - [ChatGPT© Usage](#chatgpt-usage)
    - [Initial project template](#initial-project-template)
  - [Copyright Notice](#copyright-notice)


## Tool Usage

To use the tool the first time follow the [setup](#setup) instructions. For its regular use (after installation) follow the [regular use](#regular-use) instructions.

### Setup

1. Download and install **NodeJS** *LTS* from the [official page](https://nodejs.org/en). This application has been tested on [*Node.js 18.16.1*](https://nodejs.org/en/download/releases).
2. Clone the repository:
    ```
    git clone https://github.com/jeplazas/SmartSensor_M2C.git
    ```
    Or simply [download the ZIP](https://github.com/jeplazas/SmartSensor_M2C/archive/refs/heads/main.zip) and extract its contents.
3. Enter the cloned or extracted folder and run the following command in a terminal or powershell:
    ```
    npm install
    ```
    This command should download all the necessary dependencies to run the tool.

### Regular Use

Once the [setup](#setup) is complete, follow these steps to run and use the ***MDA model-to-code tool***:

1. Enter the cloned or extracted folder (*Step 2 of the [setup](#setup)*) and run the following command to start the tool in a terminal or powershell:
    ```
    npm start
    ```
2. Open the following link to access the tool interface: (http://localhost:3000/home).
3. Click on the ``Select your XMI File`` button and select your model.
4. Click on the `Transform` button and wait until the tool finishes processing the XMI and generating the application code.
5. Download the ZIP file that the tool generated. It contains the code for the loaded model.
6. If you want to transform another model, simply follow again the steps **3** to **5** to download the generated code.
7. To stop the model to code tool, close the terminal or powershell window.

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

## Copyright Notice
Copyright &copy; 2023  Julián Eduardo Plazas.

    This Source Code Form is subject to the terms of the Mozilla Public
    License, v. 2.0. If a copy of the MPL was not distributed with this
    file, You can obtain one at http://mozilla.org/MPL/2.0/.