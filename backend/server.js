// ---- ONE-TIME FILE RENAME & DEBUG SCRIPT ----
const renameFiles = () => {
  console.log('📁 Current files in upload directory:');
  const files = fs.readdirSync(UPLOAD_DIR);
  files.forEach(f => console.log('  -', f));

  let renamedCount = 0;
  files.forEach((file) => {
    let newFile = file;

    // 1. Remove all underscores that are part of the extension or name, 
    //    but preserve the extension.
    //    We'll detect if the file ends with _JPG, _jpg, _mp4, etc.
    //    And also replace spaces with underscores or remove them.
    
    // Handle image files: replace _JPG.jpg or _JPG (no .jpg) with .JPG
    if (file.endsWith('_JPG.jpg')) {
      newFile = file.replace(/_JPG\.jpg$/, '.JPG');
    } else if (file.endsWith('_jpg.jpg')) {
      newFile = file.replace(/_jpg\.jpg$/, '.JPG');
    } else if (file.endsWith('_JPG')) {
      newFile = file.replace(/_JPG$/, '.JPG');
    } else if (file.endsWith('_jpg')) {
      newFile = file.replace(/_jpg$/, '.JPG');
    }

    // Handle video files: replace _mp4.mp4 or _mp4 with .mp4
    if (file.endsWith('_mp4.mp4')) {
      newFile = file.replace(/_mp4\.mp4$/, '.mp4');
    } else if (file.endsWith('_mp4')) {
      newFile = file.replace(/_mp4$/, '.mp4');
    }

    // Remove any remaining underscores and spaces in the name (but keep extension)
    // We'll only do this if the above didn't already change it.
    if (newFile === file) {
      // If no pattern matched, we can try to replace underscores with dots 
      // only if there's an extension after the last dot.
      const ext = file.split('.').pop();
      const name = file.slice(0, file.lastIndexOf('.'));
      // Remove underscores and spaces from the name part
      const cleanName = name.replace(/[_ ]/g, '');
      if (cleanName !== name) {
        newFile = cleanName + '.' + ext;
      }
    }

    // If the name changed, rename
    if (newFile !== file) {
      const oldPath = path.join(UPLOAD_DIR, file);
      const newPath = path.join(UPLOAD_DIR, newFile);
      if (!fs.existsSync(newPath)) {
        fs.renameSync(oldPath, newPath);
        console.log(`✅ Renamed: ${file} → ${newFile}`);
        renamedCount++;
      } else {
        console.log(`⚠️ Target already exists: ${newFile} – skipping ${file}`);
      }
    }
  });

  console.log(`✅ Done – renamed ${renamedCount} file(s).`);
};

renameFiles();
// ---- END SCRIPT ----