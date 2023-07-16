const {invoke} = window.__TAURI__.tauri;

let selected_theme;
let currently_installed;
let buttons = []

function capitalizeFirstLetter(str) {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
}

async function changeThemeToSelected(str) {
    await invoke("change_theme_to_selected", {theme: str})
        .catch(error => {
            console.log(error);
        })
}

function resetButtons() {
    for (let btn of buttons) {
        btn.classList.remove('green-border')
    }
}

async function current_installed_theme() {
    const current_installed_theme = await invoke('current_installed_theme')
    const current_theme_element = document.getElementById('current-installed-theme');
    currently_installed = current_installed_theme;
    console.log(currently_installed);
    current_theme_element.textContent = 'Current installed theme: ' + current_installed_theme
}

async function createButton(theme, thumbnail) {
    const selectionButton = document.createElement('button');
    selectionButton.type = "submit";
    selectionButton.classList.add('btn', 'btn__secondary')
    selectionButton.textContent = capitalizeFirstLetter(theme.slice(theme.lastIndexOf('/') + 1));
    if (thumbnail) {
        let imgSource = await invoke('load_image', {path: thumbnail});
        const img = document.createElement('img');
        img.src = imgSource;
        selectionButton.appendChild(img);
    }

    return selectionButton
}

async function list_themes() {
    const paths = await invoke('list_themes');
    const listElement = document.getElementById('installed_themes');

    //clear the list
    while (listElement.firstChild) {
        listElement.firstChild.remove();
    }

    // add the apply button
    const applyButton = await createButton('Apply selected theme')
    applyButton.classList.remove('btn__secondary')
    applyButton.classList.add('btn__primary');
    applyButton.id = 'apply-button';

    const noThemeButton = await createButton('No Theme')
    noThemeButton.id = 'no-theme-button'
    listElement.appendChild(noThemeButton)



    // add each path as a new list item
    for (let i = 0; i < paths.length - 1; i += 2) {
        // create a button for each theme. skip over the thumbnails.
        if (i % 2 === 0) {
            console.log("Before createButton");
            const selectionButton = await createButton(paths[i], paths[i + 1])
            console.log("After createButton");

            // create a div as an installed banner
            const installed_banner = document.createElement('div');
            installed_banner.classList.add('banner-installed')
            installed_banner.textContent = 'Installed';
            installed_banner.style.display = 'none';  // By default, hide the banner

            // check if the theme is installed. highlight if it is
            if (paths[i] + '/theme.txt' === currently_installed) {
                selectionButton.classList.add('blue-border')
                installed_banner.style.display = 'block' // Show the banner if the theme is currently installed
            }

            // make each button change the selected path variable so the apply button knows what to apply
            selectionButton.addEventListener("click", function (e) {
                e.preventDefault();
                selected_theme = paths[i];
                resetButtons();
                selectionButton.classList.add('green-border')
                document.getElementById('selected-theme').textContent = 'Currently selected theme: ' + paths[i];
            });

            const listItem = document.createElement('li')
            listItem.appendChild(installed_banner)
            listItem.appendChild(selectionButton);
            listElement.appendChild(listItem);


            buttons.push(selectionButton)
            console.log(buttons)
        }



    }
    listElement.appendChild(applyButton)
    // add apply button listener
    // not sure why this goes after the for loop, rule doesn't apply to other buttons?
    document.getElementById('apply-button').addEventListener("click", function (e) {
        e.preventDefault();
        changeThemeToSelected(selected_theme)
        document.getElementById('apply-button').textContent = 'Theme changed to: ' + selected_theme;
    });

    // give the no-theme button a theme of NOTHEME
    document.getElementById('no-theme-button').addEventListener("click", function (e) {
        e.preventDefault();
        selected_theme = "NOTHEME";
        resetButtons();
        changeThemeToSelected(selected_theme)
        document.getElementById('apply-button').textContent = 'Theme erased! No theme installed';
    });
}


window.addEventListener("DOMContentLoaded", () => {
    current_installed_theme().then(r => console.log('Showed currently installed theme' + r));
    list_themes().then(r => console.log('Displayed all themes' + r));
});


