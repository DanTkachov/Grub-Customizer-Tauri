const {invoke} = window.__TAURI__.tauri;

let selected_theme;
let currently_installed;
let selected_button;
let buttons = []

function capitalizeFirstLetter(str) {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
}

async function changeThemeToSelected(str) {
    console.log('heres the string' + str)
    await invoke("change_theme_to_selected", {theme: str})
        .catch(error => {
            console.log(error);
        })
}

function resetButtons(){
    for(let btn of buttons){
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

async function list_themes() {
    const paths = await invoke('list_themes');
    const listElement = document.getElementById('installed_themes');

    //clear the list
    while (listElement.firstChild) {
        listElement.firstChild.remove();
    }

    // add the apply button
    const applyButton = document.createElement('button');
    applyButton.type = "submit";
    applyButton.classList.add('btn', 'btn__primary');
    applyButton.textContent = 'Apply Selected Theme';
    applyButton.id = 'apply-button';



    // add each path as a new list item
    for (const path of paths) {
        // create each theme as a button
        const selectionButton = document.createElement('button');
        selectionButton.type = "submit";
        selectionButton.classList.add('btn', 'btn__secondary')
        selectionButton.textContent = capitalizeFirstLetter(path.slice(path.lastIndexOf('/') + 1));

        // create a div as an installed banner
        const installed_banner = document.createElement('div');
        installed_banner.classList.add('banner-installed')
        installed_banner.textContent = 'Installed';
        installed_banner.style.display = 'none';  // By default, hide the banner

        // //create a div as a selected banner
        // const selected_banner = document.createElement('div')
        // selected_banner.classList.add('banner-selected')
        // selected_banner.textContent = 'Selected'
        // selected_banner.style.display = 'none'
        // selected_banners.push(selected_banner);

        // check if the theme is installed. highlight if it is
        if(path + '/theme.txt' === currently_installed){
            selectionButton.classList.add('blue-border')
            installed_banner.style.display = 'block' // Show the banner if the theme is currently installed
        }


        // make each button change the selected path variable so the apply button knows what to apply
        selectionButton.addEventListener("click", function (e) {
            e.preventDefault();
            selected_theme = path;
            resetButtons();
            selectionButton.classList.add('green-border')
            document.getElementById('selected-theme').textContent = 'Currently selected theme: ' + path;
        });

        const listItem = document.createElement('li')
        listItem.appendChild(installed_banner)
        listItem.appendChild(selectionButton);
        listElement.appendChild(listItem);
        listElement.appendChild(applyButton)

        buttons.push(selectionButton)
        console.log(buttons)
    }

    // add apply button listener
    // not sure why this goes after the for loop, rule doesn't apply to other buttons?
    document.getElementById('apply-button').addEventListener("click", function (e) {
        e.preventDefault();
        changeThemeToSelected(selected_theme)
        document.getElementById('apply-button').textContent = 'Theme changed to: ' + selected_theme;
    });
}


window.addEventListener("DOMContentLoaded", () => {
    current_installed_theme().then(r => console.log('Showed currently installed theme'));
    list_themes().then(r => console.log('Displayed all themes'));
});


