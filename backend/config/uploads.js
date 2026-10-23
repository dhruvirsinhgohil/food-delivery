const path = require("path");

function getUploadsDirectory() {
  return path.resolve(
    process.env.UPLOADS_DIR || path.join(__dirname, "..", "uploads")
  );
}

module.exports = getUploadsDirectory;
