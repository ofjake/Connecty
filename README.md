# **Connecty** 
**Connecty is a lightweight FTP automation tool built with **Node.js** and **Express**.**<br>
It facilitates seamless file transfers using **basic-ftp**, with file handling powered by **Multer** and **fs-extra**.  
Ensure you have **Node.js** installed. [nodejs.org](https://nodejs.org/)

### Installation & Setup  

#### 1 Clone the Repository  
```sh
git clone https://github.com/ofjake/Connecty.git
cd Connecty  
```

#### 2 Initialize the Project
```sh
npm init -y
```

#### 3 Install Dependencies
```sh
npm install express multer basic-ftp fs-extra path
```

#### 4 In the server.js file, update FTP credentials
```sh
host: "ftp.XXX.XXX.com", // add FTP info here
user: "XXX",
password: "XXXXXXXX",
```

#### 5 In the same file, update the pickup 'Folder' and the destination (or update) 'Folder' paths
```sh
const pickupPath = `/Folder/${pickup}`; // Ftp directory to folder being duplicated
const updatePath = `/Folder/${update}`; // Ftp directory to folder being created and updated
```

#### 6 Run the Application
```sh
npm run dev
```

Once the server is running, visit: http://localhost:3000
Note: This application is designed for local use only.

#### Features
+ Automated FTP Uploads
+ Seamless File Handling with Multer

##### Contributing
I welcome any feedback or suggestions for improving this repository.

##### Credits:
This project is created by JakeRMiller. 
##### License:
This repository is licensed under the MIT License.
