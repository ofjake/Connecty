  function startProcess() {
    let pickup = document.getElementById('pickup').value;
    let update = document.getElementById('update').value;
    let files = document.getElementById('fileUpload').files;
    let startProcessButton = document.getElementById("startProcessButton");
      
    if (!pickup || !update) {
      alert("Please fill in all fields.");
      return;
    }

    startProcessButton.disabled = true;
    startProcessButton.classList.add("pulsing");
    startProcessButton.style.pointerEvents = "none";
    startProcessButton.textContent = "Working...";
  
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
        document.getElementById("progress").style.width = "100%";
        document.getElementById("newUrl").style.opacity = "1";
        startProcessButton.disabled = true;
        startProcessButton.classList.remove("pulsing");
        startProcessButton.style.backgroundColor = "var(--highlight)";
        startProcessButton.style.pointerEvents = "none"; 
        startProcessButton.textContent = "Click URL Below to Copy";
      } else {
        alert("Error processing request.");
        startProcessButton.disabled = true;
        startProcessButton.classList.remove("pulsing");
        startProcessButton.style.backgroundColor = "var(--highlight)";
        startProcessButton.style.pointerEvents = "none";
        startProcessButton.textContent = "Refresh Page and Try Again";
      }
    };
  
    xhr.send(formData);
  }
  
  // drag and drop
  document.addEventListener("DOMContentLoaded", function () {
    const dropZone = document.getElementById("dropZone");
    const fileInput = document.getElementById("fileUpload");
    const uploadForm = document.getElementById("uploadForm");
    let droppedFiles = [];
    
    dropZone.addEventListener("click", () => fileInput.click());

    dropZone.addEventListener("dragover", (event) => {
        event.preventDefault();
        dropZone.classList.add("drag-over");
    });

    dropZone.addEventListener("dragleave", () => dropZone.classList.remove("drag-over"));

    dropZone.addEventListener("drop", (event) => {
        event.preventDefault();
        dropZone.classList.remove("drag-over");
        droppedFiles = Array.from(event.dataTransfer.files);
        updateFileNameDisplay();
    });

    fileInput.addEventListener("change", () => {
        droppedFiles = Array.from(fileInput.files);
        updateFileNameDisplay();
    });

    function updateFileNameDisplay() {
        const fileNameSpan = document.getElementById("file-name");
        if (droppedFiles.length > 0) {
            fileNameSpan.textContent = droppedFiles.map(file => file.name).join(", ");
        } else {
            fileNameSpan.textContent = "";
        }
    }

    uploadForm.addEventListener("submit", function (event) {
        event.preventDefault();
        const formData = new FormData();

        for (const file of droppedFiles) {
            formData.append("files", file);
        }

        fetch("/process-ftp", {
            method: "POST",
            body: formData
        })
        .then(response => response.json())
    });
  });

  function copyUrl() {
    let urlField = document.getElementById("newUrl");
    navigator.clipboard.writeText(urlField.textContent);
    alert("Copied URL: " + urlField.textContent);
  }
  
  async function testFTP() {
    const statusDiv = document.getElementById("ftp-status");
    statusDiv.style.display = "block";
    statusDiv.innerHTML = "Testing FTP connection...";
  
    try {
      const response = await fetch("/test-ftp");
      const text = await response.text();
  
    if (response.ok) {
      statusDiv.style.color = "green";
      statusDiv.innerHTML = text;
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
      statusDiv.innerHTML = text;
    }
    } catch (error) {
      statusDiv.style.color = "red";
      statusDiv.innerHTML = "Error: " + error.message;
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
  .catch(error => console.error("Error:", error));
