const express = require("express");
const path = require("path");
const multer = require("multer");
const ftp = require("basic-ftp");
const fs = require("fs").promises;
const app = express();
const port = 3000;

// Middleware for serving static files
app.use(express.static(path.join(__dirname, "public")));
// Middleware to parse JSON & serve static files
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure Multer for file uploads
const upload = multer({ dest: "uploads/" });

// Test FTP Connection Route
app.get("/test-ftp", async (req, res) => {
    const client = new ftp.Client();
    client.ftp.verbose = true; // Logs FTP activity for debugging
    try {
        await client.access({
            host: "ftp.XXX.XXX.com", // add FTP info here
            user: "XXX",
            password: "XXXXXXXX",
            secure: true,
            secureOptions: { rejectUnauthorized: false } // Ignores expired certificate
        });
        res.send(" Connected to FTP successfully!");
    } catch (error) {
        console.error("FTP Connection Error:", error.message);
        res.status(500).send("❌ FTP Connection Failed: " + error.message);
    } finally {
        client.close();
    }
});

// Main Processing Route
app.post("/process-ftp", upload.array("files"), async (req, res) => {
    const { pickup, update } = req.body;

    if (!pickup || !update) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    const client = new ftp.Client();
    client.ftp.verbose = true;

    try {
        await client.access({
          host: "ftp.XXX.XXX.com", // add FTP info here
          user: "XXX",
          password: "XXXXXXXX",
          secure: true,
          secureOptions: { rejectUnauthorized: false } // Ignores expired certificate
        });

        const pickupPath = `/Folder/${pickup}`; // Ftp directory to folder being duplicated
        const updatePath = `/Folder/${update}`; // Ftp directory to folder being created and updated

        // Step 1: Duplicate Pickup Folder to Update
        await client.ensureDir(updatePath);
        await client.cd(pickupPath);
        const fileList = await client.list();

        // List files in the original folder
        for (const file of fileList) {
          const sourceFile = `${pickupPath}/${file.name}`;
          const destinationFile = `${updatePath}/${file.name}`;
          await client.downloadTo(path.join(__dirname, "uploads", file.name), sourceFile); // Download to local "uploads"
          await client.uploadFrom(path.join(__dirname, "uploads", file.name), destinationFile); // Upload to new folder
      }

        // Copy each file from source to destination
        for (const file of fileList) {
          if (file.name.endsWith(".html") || file.name.endsWith(".htm")) {
              const htmlFilePath = `${updatePath}/${file.name}`;

              //  Download the file
              const tempFilePath = path.join(__dirname, "uploads", file.name);
              await client.downloadTo(tempFilePath, htmlFilePath);

              //  Read and replace all `pickup` URLs inside the HTML
              let fileContent = await fs.readFile(tempFilePath, "utf8");
              let updatedContent = fileContent.replace(
                  new RegExp(`(["'\/])(${pickup})(["'\/])`, "g"), // Match inside URLs
                  `$1${update}$3`
              );

              //  Save modified content and upload back
              await fs.writeFile(tempFilePath, updatedContent, "utf8");
              await client.uploadFrom(tempFilePath, htmlFilePath);
          }
      }

          // Step 3: Upload New Files (Overwriting Existing Ones)
          for (let uploadedFile of req.files) {
            const destinationFile = `${updatePath}/${uploadedFile.originalname}`;
            await client.uploadFrom(uploadedFile.path, destinationFile);
        }

        // Return Success with New FTP URL
        res.json({
            message: "✅ FTP process completed successfully!",
            newFolderURL: `https://www.yoursite.com/Folder/${update}/index.htm`, // The site URL to the new folder
            downloadHTML: `/download/${fileList.find(f => f.name.endsWith('.htm'))?.name}`
        });

    } catch (error) {
        console.error(`❌ Error processing request: ${error.message}`);
        res.status(500).json({ error: error.message });
    } finally {
        client.close();
    }
});

// 🖥 Serve Modified HTML Files for Download
app.get("/download/:filename", async (req, res) => {
  const filePath = path.join(__dirname, "downloads", req.params.filename);
  
  try {
      //  Check if the file exists
      await fs.access(filePath);
      res.download(filePath); // Send file for download
  } catch (error) {
      console.error(`❌ File not found: ${filePath}`);
      res.status(404).send("File not found");
  }
});

//  API Route to Download Modified HTML
app.get("/download/:filename", async (req, res) => {
    const filePath = path.join(DOWNLOADS_DIR, req.params.filename);
    try {
        await fs.access(filePath); // Ensure file exists
        res.download(filePath);
    } catch {
        res.status(404).send("❌ File not found.");
    }
});

app.listen(port, () => {
    console.log(`🚀 Server running on http://localhost:${port}`);
});
