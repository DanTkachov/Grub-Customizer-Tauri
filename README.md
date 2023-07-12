# Grub Customizer

This is my version of a grub customizer built with the intention to allow users to swap themes easily and quickly.

Requires "sudo" to run properly 

## Code

The code used for finding a users filepaths (to themes and to grub config) is located in /src-tauri/paths.rs

The rust bindings for javascript are found in /src-tauri/main.rs

javascript code dictating buttons and banners are in /src/main.js

HTML/SCSS is in /src/index.html and /src/styles.scss (compiled to css)


## To-Do:
- Add a "No theme" option
- Render Thumbnails for themes properly (Currently unfinished)
- Add a small banner to depict which theme is currently selected for the user (currently using a green border around the theme)
- Add the ability to set wallpapers instead of a whole theme
