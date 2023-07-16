pub mod path {
    use std::fs::File;
    use std::io::{BufReader, BufRead, Error, Write};
    use std::{fs};
    use std::path::Path;
    use std::process::Command;

    pub struct Thumbnail {
        pub path: String,
        pub thumbnail_path: String,
    }

    pub fn get_paths() -> Vec<Thumbnail> {
        let mut themes: Vec<Thumbnail> = Vec::new();
        let paths = fs::read_dir("/boot/grub/themes").unwrap();
        for i in paths {
            let theme = Thumbnail{
                path: i.as_ref().unwrap().path().display().to_string(),
                thumbnail_path: largest_image_in_dir(i.unwrap().path().display().to_string()),
            };
            themes.push(theme)
        }
        themes
    }

    pub fn largest_image_in_dir(dir: String) -> String {
        let path = Path::new(&dir);
        let mut largest_size: u64 = 0;
        let mut largest_file = String::new();

        fs::read_dir(path).unwrap().filter_map(Result::ok).filter(|entry| {
            let path = entry.path();
            let ext = path.extension().and_then(|os_str| os_str.to_str()).unwrap_or("");
            path.is_file() && (ext == "jpg" || ext == "jpeg" || ext == "png")
        })
            .for_each(|entry| {
                let size = entry.metadata().unwrap().len();
                if size > largest_size {
                    largest_size = size;
                    largest_file = entry.path().to_str().unwrap().to_string();
                }
            });

        return largest_file;
    }

    pub fn current_theme() -> Result<String, Error> {
        // Read in the current file
        let input = File::open("/etc/default/grub")?;
        let buffered = BufReader::new(input);
        let r: String = String::from("No themes found, please install themes to see them here.");

        // Analyze each line
        for line in buffered.lines() {
            // Split the line to find which one has GRUB_THEME in it
            let temp = line.unwrap();
            let x: Option<(&str, &str)> = temp.split_once('=');
            match x {
                Some(a) =>
                    {
                        if a.0 == "GRUB_THEME" {
                            return Ok(a.1.to_string());
                        }
                        if a.0 == "#GRUB_THEME" ||  a.0 == "# GRUB_THEME"{
                            return Ok(String::from("No theme installed"));
                        }
                    }
                _ => continue,
            }
        }
        return Ok(r);
    }

    pub fn change_theme(theme: String) -> Result<String, Error> {
        let grub_config_path = Path::new("/etc/default/grub");
        let grub_config = File::open(&grub_config_path)?;
        let mut lines = Vec::new();

        let reader = BufReader::new(grub_config);

        for line in reader.lines() {
            let line = line?;
            // if line.starts_with("GRUB_THEME=" || "#GRUB_THEME" || "# GRUB_THEME") {
            if ["GRUB_THEME=", "#GRUB_THEME", "# GRUB_THEME"].iter().any(|&s| line.starts_with(s)){
                println!("{}", line.to_string());
                if theme == String::from("NOTHEME"){
                    lines.push(format!("#GRUB_THEME="));
                } else{
                    lines.push(format!("{}{}{}", "GRUB_THEME=", theme, "/theme.txt"));
                }
            } else {
                lines.push(line);
            }
        }

        let temp_file_path = Path::new("./grub_temp");
        let mut temp_file = File::create(&temp_file_path)?;
        for line in &lines {
            writeln!(temp_file, "{}", line)?;
        }

        fs::rename(temp_file_path, grub_config_path)?;

        Ok(String::from("Theme changed successfully"))
    }

    pub fn sudo_update_grub() -> Result<String, String> {
        let command = Command::new("sudo")
            .arg("update-grub")
            .output()
            .expect("failed to execute sudo");
        if command.status.success() {
            Ok(String::from("Updated Grub!"))
        } else {
            Err(String::from("Failed to update grub"))
        }
    }
}