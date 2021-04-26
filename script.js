function toggle_sidebar(){
    let sidebar = document.getElementById("conteneur-gauche");
    sidebar.classList.toggle("sidebar--collapsed");
    var width = sidebar.offsetWidth;
    console.log(typeof(width));
    let main = document.getElementById("conteneur-droit");
    console.log(largeur_initiale_sidebar);
    if (sidebar_state) {
        sidebar.style.left = valeur_decalage;
        main.style.marginLeft = "0px";
    } else {
        sidebar.style.left = "0";
        main.style.marginLeft = String(width) + "px";

        
    }
}

function toggle_sidebar_border_color() {

}

function toggle_icone() {
    let icone = document.getElementById("icone-sidebar");
    icone.classList.toggle("fa-angle-double-right");
    if (sidebar_state) {
        icone.style.color = "var(--blanc)";
        console.log("ici");
    } else {
        icone.style.color = "var(--main)";
        console.log("là");
    }
}

function toggle_border_icone() {
    let conteneur_icone = document.getElementById("closed-icon");
    let style_conteneur_icone = conteneur_icone.style;
    if (sidebar_state){ /*si sidebar affichée*/
        style_conteneur_icone.right = "-40px";
        style_conteneur_icone.borderRadius = "0 20px 20px 0";
        style_conteneur_icone.backgroundColor = "var(--main)";

    } else {
        style_conteneur_icone.right = "0px";
        style_conteneur_icone.borderRadius = "20px 0 0 20px";
        style_conteneur_icone.backgroundColor = "var(--blanc)";

    }
}

function toggle() {
    toggle_sidebar();
    toggle_icone();
    toggle_border_icone();
    sidebar_state = !(sidebar_state)
}


function ouverture(){
    document.getElementById("info-panel").style.width = "800px";
    document.getElementById("info-panel").style.left = "0";
}

function fermeture(){
    document.getElementById("info-panel").style.left = "-900px";
}

let btn = document.getElementById("closed-icon");
let sidebar_state = true; /*sidebar affichée par défaut à l'ouverture)*/
btn.addEventListener("click", toggle);


let btn_ouverture_info_panel = document.getElementById("info-licence");
btn_ouverture_info_panel.addEventListener("click", ouverture);
let btn_fermeture_info_panel = document.getElementById("btn-fermeture");
btn_fermeture_info_panel.addEventListener("click", fermeture)



var style = getComputedStyle(document.body);
let largeur_initiale_sidebar = parseInt(style.getPropertyValue("--sidebar-width").replace('px', ''));
console.log(largeur_initiale_sidebar);
let largeur_bordure = parseInt(style.getPropertyValue("--sidebar-border-width").replace("px", ""));
console.log(largeur_bordure);
let valeur_decalage = "-" + String(largeur_initiale_sidebar - largeur_bordure) + "px";
console.log(valeur_decalage);