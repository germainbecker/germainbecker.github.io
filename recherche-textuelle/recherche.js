function commencer() {
    recherche.commencer();
    afficher_recherche(recherche);
}

function reculer() {
    recherche.reculer();
    afficher_recherche(recherche);
}

function avancer() {
    recherche.avancer();
    afficher_recherche(recherche);
}

function aller_en_position(pos) {
    recherche.aller_en_position(pos);
    afficher_recherche(recherche);
}

function terminer() {
    recherche.terminer();
    afficher_recherche(recherche);
}

function afficher_comparaisons(html) {
    document.getElementById("comparaisons").innerHTML = html;
}

function afficher_positions_trouvees(html) {
    document.getElementById("pos-motif").innerHTML = html; 
}

function afficher_motif(html) {
    document.getElementById("motif").innerHTML = html;
}

function afficher_phrase(html) {
    document.getElementById("phrase").innerHTML = html;
}

function remplir_champ_phrase(html) {
    document.getElementById("iphrase").value = html;
}

function remplir_champ_motif(html) {
    document.getElementById("imotif").value = html;
}

function afficher_recherche(recherche) {
    afficher_comparaisons(recherche.get_comparaisons_html());
    afficher_positions_trouvees(recherche.get_positions_trouvees());
    afficher_motif(recherche.get_motif_html());
    afficher_phrase(recherche.get_phrase_html());
    maj_donnees_en_cours();
}

function afficher_table_decalages(recherche) {
    let decalages = document.getElementById("decalages");
    let translation = recherche.get_decalages();
    console.log("trans" + translation);
    decalages.innerHTML = "";

    /*table du mauvais caractères de BMH*/
    if (!(translation instanceof Array)){
        
        if ((Object.keys(translation).length == 0) || ("" in translation && translation[""] == 0)) {
            return;
        }
        let premiere_ligne = "<tr><th id=\"lettre\">lettre</th><th id=\"decalage\">décalage</th></tr>";
        lettres = Object.keys(translation);
        let html ="";
        lettres.forEach(lettre => {
            html += "<tr><td>" + lettre + "</td><td>" + translation[lettre] + "</td></tr>";
        })
        html = premiere_ligne + html;
        decalages.innerHTML = html;
       /*  for (let lettre in translation) {
            decalages.innerHTML += "<tr><td>" + (lettre || "autres") + "</td><td>" + translation[lettre] + "</td></tr>"; // ajoute des <tbody> </tbody> autour de chaque ligne du tableau --> pourquoi ???
        } */
    } else { 
        /*table du mauvais caractère de BMH améliorée*/
        if (translation.length == 0) {
            return;
        }
        let premiere_ligne = "";
        let nb_lignes = translation.length;
        let ind_derniere_ligne = nb_lignes - 1;
        let lettres = Object.keys(translation[ind_derniere_ligne]); /*on récupère toutes les lettres de la table */
        let nb_colonnes = lettres.length;

        lettres.forEach(lettre => {
            premiere_ligne += "<th>" + lettre + "</th>";
        });
        premiere_ligne = "<tr><th class=\"cache\"></th>" + premiere_ligne + "</tr>"; // 1ère case vide

        html = premiere_ligne;

        for (let num = 0; num < nb_lignes; num++) {
            let contenu = "<td class=\"num-ligne\">" + num + "</td>";
            let obj = translation[num];
            let valeurs_decalage = Object.values(obj);
            let cases_manquantes = nb_colonnes;
            for (const valeur of valeurs_decalage) {
                contenu += "<td>" + valeur + "</td>";
                cases_manquantes -= 1;
            }
            for (let k = 0; k < cases_manquantes; k++) {
                contenu += "<td></td>";
            }

            contenu = "<tr>" + contenu + "</tr>";
            html += contenu;
        }

        decalages.innerHTML = html;
        
    }
    console.log(decalages.innerHTML); 
}

function afficher_titre(recherche) {
    let titre = document.getElementById("titre-algo");
    for (let i = 0; i < liste_algo.length; i++) {
        if (liste_algo[i][0] == fonction_recherche) {
            titre.innerHTML = liste_algo[i][1];
            break;
        }
    }
}

function update(pos = 0) {
    let iphrase = document.getElementById("iphrase");
    let imotif = document.getElementById("imotif");
    let phrase = iphrase.value;
    let motif = imotif.value;
    recherche = new Recherche(motif, phrase, fonction_recherche);
    afficher_titre(recherche);
    if (!(pos == 0)) {   // si on veut une position précise
        aller_en_position(pos); // on met à jour la position de l'historique (appelle la fonction afficher_recherche)
    }    
    afficher_table_decalages(recherche);
    afficher_recherche(recherche);
    maj_donnees_en_cours();
    effacer_champ_url();
    console.log(donnees_en_cours);
}


/***************************************** */

function Chaine(chaine, classe="normal") {
    this.caracteres = [];
    for (let i = 0; i < chaine.length; i++) {
        let lettre = chaine[i];
        this.caracteres.push({"caractere":lettre, "classe":classe, "isurligne": false});
    }

    this.get_caracteres = function() {
        let carac = this.caracteres;
        return carac;
    }
    
    this.set_classe = function(i=-1, classe="normal") {
        if (0 <= i && i < this.caracteres.length) {
            this.caracteres[i]["classe"] = classe;
        } else {
            for (i = 0; i < this.caracteres.length; i++) {
                this.caracteres[i]["classe"] = classe;
            }
        }
    }

    this.set_classe_trouve = function(phrase_index, longueur_motif) {
        for (let i = phrase_index; i < phrase_index + longueur_motif; i++) {
            //console.log("pos:" + i);
            this.caracteres[i]["classe"] = "csurligne";
            //console.log("carac : " + this.get_caracteres()[i]);
        }        
    }

    

    this.set_classe_index = function(i) {
        //console.log("index : " + phrase_index);
        //console.log("longueur : " + longueur_motif);
        if (0 <= i && i < this.caracteres.length) {
            this.caracteres[i]["isurligne"] = true;
        }        
    }
     
      
    this.toHTML = function() {
        let html = "";
        let remplacement = {" ":"&nbsp;", "<":"&lt;", ">":"&gt;", "&":"&amp;", '"':"&quot;"}
        for (let i = 0; i < this.caracteres.length; i++) {
            let lettre = this.caracteres[i]["caractere"];
            lettre = (lettre in remplacement ? remplacement[lettre] : lettre);
            let classe = this.caracteres[i]["classe"];
            
            // -----------------
            let isurligne = (this.caracteres[i]["isurligne"] == true ? "isurligne" : "");
            let div_index = "<div class=\"index " + isurligne + "\">" + i + "</div>";
            // -----------------

            let div_lettre = "<div class=\"boite " + classe + "\">" + lettre + "</div>";
            let cadre = "<div class=\"cadre\">" + div_index + div_lettre + "</div>";
            html += cadre;
        }
        return html;
    }
}

function Historique(motif, phrase) {
    this.motif = motif;
    this.phrase = phrase;
    this.historique = [{"type":"deplacer", "position":0}];
    
    this.deplacer = function(index) {
        this.historique.push({"type":"deplacer", "position":index});
    }

    this.comparer = function(motif_index, phrase_index) {
        this.historique.push({"type":"comparer", "mi":motif_index, "pi":phrase_index});
    }

    // ------------------
    this.trouver = function(phrase_index) {
        this.historique.push({"type":"trouver", "pos": phrase_index});
    }
    // ------------------

    this.generer_html = function() {
        let phrase_html = [];
        let motif_html = [];
        let comparaisons_html = [];
        
        let pos_motif = []; // AJOUT tableau d'entiers
        let pos_motif_html = []; // AJOUT tableau de chaines

        let cmotif = new Chaine(this.motif);
        let cphrase = new Chaine(this.phrase);
        let comparaisons = 0;
        let decalage = 0;
        for (let i = 0; i < this.historique.length; i++) {
            let action = this.historique[i];

            switch (action["type"]) {
                case "deplacer":
                    cphrase.set_classe();
                    cmotif.set_classe();
                    decalage = action["position"];
                    break;
                case "comparer":
                    comparaisons++;
                    let mi = action["mi"];
                    let pi = action["pi"];
                    let classe = (this.motif[mi] == this.phrase[pi] ? "egalite" : "difference");
                    cphrase.set_classe(pi, classe);
                    cmotif.set_classe(mi, classe);
                    break;
                case "trouver":                   // AJOUT DU CAS OÙ LE MOTIF EST TROUVÉ
                    let position = action["pos"];
                    pos_motif.push(position);                    
                    cphrase.set_classe_index(position);
                    cphrase.set_classe_index()
                    cphrase.set_classe_trouve(position, this.motif.length);
                    cmotif.set_classe(-1, "csurligne"); 
                    break;
                                   
            }

            cinvisibles = new Chaine("_".repeat(decalage), "invisible");
            phrase_html.push(cphrase.toHTML());
            motif_html.push(cinvisibles.toHTML() + cmotif.toHTML());
            comparaisons_html.push(comparaisons);
            pos_motif_html.push(pos_motif.join(" - "));
        }
        return {"phrase":phrase_html, "motif":motif_html, "comparaisons":comparaisons_html, "positions": pos_motif_html, "isurlignes": pos_motif}; // AJOUT clé "positions"
    }
}

function Recherche(motif, phrase, algorithme_recherche) {
    let resultat = algorithme_recherche(motif, phrase);
    let html = resultat["historique"].generer_html();
    this.decalages_table = resultat["table"];
    this.comparaisons_html = html["comparaisons"];

    this.positions_html = html["positions"]; // AJOUT 
    this.indices_surlignes = html["isurlignes"] // AJOUT

    this.motif_html = html["motif"];
    this.phrase_html = html["phrase"];
    this.index = 0;

    this.get_index = function() {
        return this.index;
    }

    this.get_decalages = function() {
        return this.decalages_table;
    }
    this.get_comparaisons_html = function() {
        return this.comparaisons_html[this.index];
    }

    //----------------------
    this.get_positions_trouvees = function() {
        return this.positions_html[this.index];
    }
    this.get_indices_surlignes = function() {
        return this.indices_surlignes[this.index];
    }
    //----------------------
    
    this.get_motif_html = function() {
        return this.motif_html[this.index];
    }
    this.get_phrase_html = function() {
        return this.phrase_html[this.index];
    }
    this.commencer = function() {
        this.index = 0;
    }
    this.reculer = function() {
        this.index -= 1;
        this.index = Math.min(Math.max(this.index, 0), this.phrase_html.length-1);
    }
    this.avancer = function() {
        this.index += 1;
        this.index = Math.min(Math.max(this.index, 0), this.phrase_html.length-1);
    }

    this.aller_en_position = function(pos) {
        if (pos >= 0 && pos <= this.phrase_html.length-1) {
            this.index = pos;
        } 
    }

    this.terminer = function() {
        this.index = this.phrase_html.length-1;
    }
}

/***************************/

function calculer_decalages(motif) {
    let decalages = {};
    for (let i = 0; i < motif.length-1; i++) {
        let lettre = motif[i];
        decalages[lettre] = motif.length - 1 - i;
    }
    decalages[""] = motif.length;
    return decalages;
}

function calculer_decalages_ameliores(motif) {
    let MC = [];
    for (let j = 0; j < motif.length; j++) {
        let decalages = {};
        for (let k = 0; k < j; k++) {
            let lettre = motif[k];
            decalages[lettre] = j - k;
        }
        MC.push(decalages);
    }
    return MC
}

function recherche_boyermoore_horspool(motif, phrase) {
    let decalages = calculer_decalages(motif);
    delete decalages[""];  // supression du décalage par défaut
    let historique = new Historique(motif, phrase);
    let debut = 0;
    while (debut + motif.length <= phrase.length) {
        let trouve = true;
        let k;
        for (k = motif.length - 1; k >= 0; k--) {
            historique.comparer(k, debut + k);
            if (motif[k] != phrase[debut + k]) {
                trouve = false;
                break;   // motif != phrase[debut:fin+1]
            }
        }
        if (trouve) {
            historique.trouver(debut); // AJOUT de la position de l'occurrence trouvée
            //return {"position":debut, "historique":historique, "table":decalages};   // motif == phrase[debut:debut+...]
        }
        let decalage = k + 1;
        let lettre = phrase[debut + k];
        if (lettre in decalages) {
            let posfin = motif.length - 1 - k;
            decalage = decalages[lettre] - posfin;
        }
        debut += Math.max(decalage, 1);  // si décalage négatif on décale d'un cran seulement
        historique.deplacer(debut);
    }
    return {"position":-1, "historique":historique, "table":decalages};  // motif non trouvé
}

function recherche_boyermoore_horspool_amelioree(motif, phrase) {
    let table_decalages = calculer_decalages_ameliores(motif);
    //delete table_decalages[""];  // supression du décalage par défaut
    let historique = new Historique(motif, phrase);
    let debut = 0;
    while (debut + motif.length <= phrase.length) {
        let trouve = true;
        let decalage = 0;
        for (k = motif.length - 1; k >= 0; k--) {
            historique.comparer(k, debut + k);
            if (motif[k] != phrase[debut + k]) {
                trouve = false;
                // calcul du décalage
                let lettre = phrase[debut + k];
                if (lettre in table_decalages[k]) {
                    decalage = table_decalages[k][lettre];
                } else {
                    decalage = k + 1;
                }
                break;
            }
        }
        if (trouve) {
            historique.trouver(debut); // AJOUT de la position de l'occurrence trouvée
            decalage = 1;
            //return {"position":debut, "historique":historique, "table":table_decalages};   // motif == phrase[debut:debut+...]
        }
        debut += decalage
        historique.deplacer(debut);
    }
    return {"position":-1, "historique":historique, "table":table_decalages};  // motif non trouvé
}

/* function recherche_horspool(motif, phrase) {
    let decalages = calculer_decalages(motif);
    let historique = new Historique(motif, phrase);
    let i = motif.length - 1;
    while (i < phrase.length) {
        historique.comparer(motif.length-1, i);
        if (phrase[i] == motif[motif.length-1]) {
            let debut = i + 1 - motif.length;
            let trouve = true;
            for (let k = 0; k < motif.length-1; k++) {
                historique.comparer(k, debut+k);
                if (motif[k] != phrase[debut + k]) {
                    trouve = false;
                    break;   // motif != phrase[debut:i+1]
                }
            }
            if (trouve) {
                historique.trouver(debut);
                //return {"position":debut, "historique":historique, "table":decalages};   // motif == phrase[debut:i+1]
            }
        }

        //-------MODIF SINON BOUCLE INFINIE SI LE MOTIF EST VIDE---------
        if (motif.length == 0) {
            i += 1;
        } else {
            i += decalages[phrase[i]] === undefined ? motif.length : decalages[phrase[i]];
        }
        //-----------------------------------------
        historique.deplacer(i + 1 - motif.length);
    }
    return {"position":-1, "historique":historique, "table":decalages};  // motif non trouvé
} */

function recherche_naive(motif, phrase) {
    let historique = new Historique(motif, phrase);
    let debut = 0;
    while (debut + motif.length <= phrase.length) {
        let trouve = true;
        for (let k = 0; k < motif.length; k++) {
            historique.comparer(k, debut+k);
            if (motif[k] != phrase[debut + k]) {
                trouve = false;
                break;   // motif != phrase[debut:i+1]
            }
        }
        if (trouve) {
            historique.trouver(debut); // AJOUT de la position de l'occurrence trouvée

            //historique.motif_trouve.push(debut);
            // return {"position":debut, "historique":historique, "table":{}};  // motif == phrase[debut:...]
        }        
        debut += 1;
        historique.deplacer(debut);
    }
    return {"position":-1, "historique":historique, "table":{}};  // motif non trouvé
}


/************ AJOUT ********************/

function type_de_recherche(parametres_url) {
    fonction_recherche = recherche_naive; // par défaut
    if (parametres_url.has('r')) {
        let rech = parametres_url.get('r');
        switch (rech) {
            case "n":
                fonction_recherche = recherche_naive;
                break;
            case "bmh":
                fonction_recherche = recherche_boyermoore_horspool;
                break;
            case "bmha":
                fonction_recherche = recherche_boyermoore_horspool_amelioree;
                break;
        }   
    }
    return fonction_recherche;
}

function phrase_depart(parametres_url) {
    let texte = "";
    if (parametres_url.has('t')) {
        texte = parametres_url.get('t');    
    }
    return texte;
}

function motif_depart(parametres_url) {
    let motif = "";
    if (parametres_url.has('m')) {
        motif = parametres_url.get('m');    
    }
    return motif;
}

function position_depart(parametres_url) {
    function estEntierPositif(valeur) { 
        return /^\d+$/.test(valeur);    // expression régulière (\d --> [0-9])
    } 
    let pos;
    if (parametres_url.has('p')) {
        pos = (estEntierPositif(parametres_url.get('p')) ? parseInt(parametres_url.get('p')) : 0);             
    }
    return pos;
}

function cocher_bouton_radio(fonction_recherche) {
    if (fonction_recherche == recherche_naive) {
        document.getElementById("rech_naive").checked = true;
    } else if (fonction_recherche == recherche_boyermoore_horspool) {
        document.getElementById("rech_bmh").checked = true;
    } else {
        document.getElementById("rech_bmha").checked = true;
    }
}

function initialisation() {
    // analyse de l'URL
    let url = new URL(window.location.href);
    let parametres = new URLSearchParams(url.search);
    fonction_recherche = type_de_recherche(parametres);
    let texte_d = phrase_depart(parametres);
    let motif_d = motif_depart(parametres);
    let position_d = position_depart(parametres);
    // remplissage des champs "phrase" et "motif" si nécessaire
    if (!(texte_d == "")) {
        remplir_champ_phrase(texte_d);
    }
    if (!(motif_d == "")) {
        remplir_champ_motif(motif_d);
    }
    cocher_bouton_radio(fonction_recherche);
    update(position_d);
}

function maj_donnees_en_cours() {
    // nécessite qu'une recherche soit lancée
    let phrase = document.getElementById("iphrase").value;
    let motif = document.getElementById("imotif").value;
    let position = recherche.get_index();
    donnees_en_cours["phrase"] = phrase;
    donnees_en_cours["motif"] = motif;
    donnees_en_cours["fonction"]["nom"] = fonction_recherche;
    donnees_en_cours["fonction"]["param"] = parametre_de_fonction_recherche(fonction_recherche);
    donnees_en_cours["position"] = position;
}

function construire_url() {
    let url = new URL(window.location.href);
    let url_origine = url.origin.toString(); // domaine
    let url_chemin_acces = url.pathname.toString(); // chemin d'accès
    let nouveaux_parametres = new URLSearchParams(); // vide au départ
    let param_rech = donnees_en_cours["fonction"]["param"];
    let param_phrase = donnees_en_cours["phrase"];
    let param_motif = donnees_en_cours["motif"];
    let param_pos = donnees_en_cours["position"];
    if (!(param_rech == "n")) {
        nouveaux_parametres.append("r", param_rech);
    }
    if (!(param_phrase == "")) {
        nouveaux_parametres.append("t", param_phrase);
    }
    if (!(param_motif == "")) {
        nouveaux_parametres.append("m", param_motif);
    }
    if (!(param_pos == 0)) {
        nouveaux_parametres.append("p", param_pos.toString());
    }
    let chaine_nouveaux_parametres = nouveaux_parametres.toString();
    let url_sortie = url_origine + url_chemin_acces;
    if (!(chaine_nouveaux_parametres === "")) {
        url_sortie += "?" + chaine_nouveaux_parametres;
    }
    return url_sortie;    
}

function remplir_champ_url(url) {
    document.getElementById("url-de-sortie").value = url;
}

function generer_url() {
    let url_sortie = construire_url();
    remplir_champ_url(url_sortie);
}

function construire_url_code_integration(){
    let url_sortie = construire_url(); // URL "classique"
    console.log(url_sortie);
    var url_code = new URL(url_sortie);
    let chemin_acces = url_code.pathname.toString();
    console.log(chemin_acces);
    let nouveau_chemin_acces = chemin_acces.substring(0, chemin_acces.lastIndexOf('/') + 1);
    console.log(nouveau_chemin_acces);
    url_code.pathname = nouveau_chemin_acces + "iframe-embed.html";
    return url_code.toString();
}

function construire_code_integration() {
    let url_code = construire_url_code_integration();
    let code_integration = "<iframe width=\"800\" height=\"500\" frameborder=\"0\" src=\"" + url_code + "\"></iframe>";
    return code_integration; 
}

function remplir_champ_code_integration(code_integration) {
    document.getElementById("champ-code-integration").value = code_integration;
}

function generer_code_integration() {
    code_integration = construire_code_integration();
    console.log(code_integration);
    remplir_champ_code_integration(code_integration);
    
}

function effacer_champ_url() {
    document.getElementById("url-de-sortie").value = "";
}

let liste_algo = [
    [recherche_naive, "Algorithme naïf"],
    [recherche_boyermoore_horspool, "Algorithme de Boyer-Moore-Horspool"],
    [recherche_boyermoore_horspool_amelioree, "Algorithme de Boyer-Moore-Horspool \"amélioré\""]
]

let donnees_en_cours = {
    // valeurs par défaut
    "phrase" : "",
    "motif" : "",
    "fonction" : {'nom' : recherche_naive, 'param' : 'n'},
    "position" : 0,
}

parametre_de_fonction_recherche = function(fonction_recherche) {
    switch (fonction_recherche) {
        case recherche_naive:
            return "n";
        case recherche_boyermoore_horspool:
            return "bmh";
        case recherche_boyermoore_horspool_amelioree:
            return "bmha";
    }
}

changer_algo = function() {
    let choix_algo = select_algo.value;
    switch (choix_algo) {
        case "rech_naive":
            fonction_recherche = recherche_naive;
            break;
        case "bmh":
            fonction_recherche = recherche_boyermoore_horspool;
            break;
        case "bmha":
            fonction_recherche = recherche_boyermoore_horspool_amelioree;
            break;
    }
    update();
}

selectionner_algo = function() {
    let choix_algo = document.querySelector('input[name="choix-algo"]:checked').value;
    switch (choix_algo) {
        case "rech_naive":
            fonction_recherche = recherche_naive;
            break;
        case "bmh":
            fonction_recherche = recherche_boyermoore_horspool;
            break;
        case "bmha":
            fonction_recherche = recherche_boyermoore_horspool_amelioree;
            break;
    }
    update();
}

fonction_recherche = recherche_naive;

initialisation();

/************* EVENT LISTENERS **************** */

/* --- SELECTION DE L'ALGO --- */

/* par la liste d'options (cachée finalement)*/
let select_algo = document.getElementById("select-algo");

select_algo.addEventListener("change", changer_algo);

/* par les boutons radio */
let radio_btn = document.getElementsByName('choix-algo');
for (let i = 0; i < radio_btn.length; i++) {
    radio_btn[i].addEventListener('change', selectionner_algo);
}

/* --- TOUT EFFACER --- */

reinitialiser = function() {
    let url_origine = new URL(window.location.origin);
    document.location.replace(url_origine);
}

let btn_effacer = document.getElementById("reinitialiser");

btn_effacer.addEventListener('click', reinitialiser);

/* --- BOUTONS DE DEFILEMENT ANIMATION --- */
let btn_commencer = document.getElementById("commencer");
let btn_reculer = document.querySelector("#reculer");
let btn_avancer = document.getElementById("avancer");
let btn_terminer = document.querySelector("#terminer");

btn_commencer.addEventListener("click", commencer);
btn_reculer.addEventListener("click", reculer);
btn_avancer.addEventListener("click", avancer);
btn_terminer.addEventListener("click", terminer);


/* CHAMPS DE SAISIE INPUT */ 
let zone_phrase = document.querySelector("#iphrase");
let zone_motif = document.querySelector("#imotif");

zone_phrase.addEventListener("keyup", update);
zone_motif.addEventListener("keyup", update);


/* GENERATION URL */

let btn_url = document.getElementById("btn-lien-url");
btn_url.addEventListener("click", generer_url);

/* GENERATION CODE D'INTEGRATION */

let btn_lien_integration = document.getElementById("btn-lien-integration");
btn_lien_integration.addEventListener("click", generer_code_integration);
