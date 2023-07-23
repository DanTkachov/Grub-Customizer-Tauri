## Grub Customizer

This is my version of a grub customizer built with the intention to allow users to swap themes easily and quickly.

Requires "sudo" in order to update the grub config that is a system file.

Not compatible on systems running fedora

![screenshot of program](src/assets/Completed%20Screenshot.png)

# Installation
Installation requires cargo, tauri and debtap (debtap available from the AUR on arch)

For users on Arch-based systems:

Clone the repository:
```bash
git clone https://github.com/DanTkachov/Grub-Customizer-Tauri
cd Grub-Customizer-Tauri
```

Build the project:
```bash
cargo tauri build
```

If not on a debian system: Use debtap on the deb file to create a .tar.zst
```bash
debtap src-tauri/target/release/bundle/deb/grub-theme-swap_0.0.0_amd64.deb
```

Use pacman to install the package:
```bash
sudo pacman -U src-tauri/target/release/bundle/deb/grub-theme-swap
```

Now run the program with
```bash
sudo grub-theme-swap
```


# Code

The code used for finding a users filepaths (to themes and to grub config) is located in /src-tauri/paths.rs

The rust bindings for javascript are found in /src-tauri/main.rs

javascript code dictating buttons and banners are in /src/main.js

HTML/SCSS is in /src/index.html and /src/styles.scss (compiled to css)