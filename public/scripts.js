
      function startProcess() {
        let pickup = document.getElementById('pickup').value;
        let update = document.getElementById('update').value;
        let files = document.getElementById('fileUpload').files;
          
        if (!pickup || !update) {
          alert("Please fill in all fields.");
          return;
        }

        let formData = new FormData();
        formData.append("pickup", pickup);
        formData.append("update", update);
        for (let file of files) {
          formData.append("files", file);
        }

        let xhr = new XMLHttpRequest();

        xhr.open("POST", "/process-ftp", true);
        xhr.onload = function () {
          if (xhr.status === 200) {
            let response = JSON.parse(xhr.responseText);
            document.getElementById("newUrl").textContent = response.newFolderURL;
            document.getElementById("progress").style.width = 100 + "%";
            document.getElementById("newUrl").style.opacity = "1";
          } else {
            alert("Error processing request.");
          }
        };

        xhr.send(formData);
      }

      function copyUrl() {
        let urlField = document.getElementById("newUrl");
        navigator.clipboard.writeText(urlField.textContent);
        alert("Copied URL: " + urlField.textContent);
      }

      async function testFTP() {
        const statusDiv = document.getElementById("ftp-status");
        statusDiv.style.display = "block";
        statusDiv.innerHTML = "⏳ Testing FTP connection...";

      try {
        const response = await fetch("/test-ftp");
        const text = await response.text();

        if (response.ok) {
          statusDiv.style.color = "green";
          statusDiv.innerHTML = "✅ " + text;
          statusDiv.style.opacity = "1";
          statusDiv.style.transition = "opacity 1s";
            setTimeout(() => {
              statusDiv.style.opacity = "0"; 
                setTimeout(() => {
                  statusDiv.innerHTML = "";
                }, 1000);
            }, 2000);
        } else {
          statusDiv.style.color = "red";
          statusDiv.innerHTML = "❌ " + text;
        }
        } catch (error) {
          statusDiv.style.color = "red";
          statusDiv.innerHTML = "❌ Error: " + error.message;
        }
      }

      document.getElementById("fileUpload").addEventListener("change", function() {
        let fileList = this.files;
        let fileNameDisplay = document.getElementById("file-name");
    
        if (fileList.length > 0) {
          let names = [];
          for (let i = 0; i < fileList.length; i++) {
            names.push(fileList[i].name);
          }
          fileNameDisplay.textContent = names.join(", ");
        } else {
          fileNameDisplay.textContent = "No file chosen";
        }
      });

      fetch("/process-ftp", {
      method: "POST",
      body: formData
      })
      .then(response => response.json())
      .then(data => {
        if (data.downloadHTML) {
          const downloadButton = document.getElementById("downloadToDesktop");
          downloadButton.style.display = "block";
          downloadButton.onclick = () => {
          window.location.href = `/download/${data.downloadHTML}`;
          };
        }
      })
      .catch(error => console.error("❌ Error:", error));