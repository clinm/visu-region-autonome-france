# Pré-requis :
1. Installer Python3 :

	apt-get install python3
    ou
	brew install python3
	
# Installation
## Traitement des données
Pour traiter les données, nous utilisons le script python "etl.py". Les données sont déjà traitées pour le site web mais vous pouvez utiliser le script pour regénérer les données en JSON.

La commande est la suivante : 
	python3 etl.py \<nom_du_fichier_de_sortie>
	
Exemple : 
	python3 etl.py data.json
	
## Le site
Le site est simplement à lancer dans votre navigateur à partir du fichier index.html du répertoire principal. 
Navigateur de préférence : Chrome ou Firefox.
	
# Architecture logicielle
- Rapport.html : Page du site avec le compte-rendu du projet
- datasource : données de base du site Eider
- etl.py : script python pour le traitement des données
- index.html : Page principale du site web
- bar-chart : répertoire du widget Javascript pour l'histogramme
- css : feuilles CSS du site web
- js : scripts javascripts pour le site web
- rankArray : répertoire du widget pour le tableau récapitulatif du classement
- rankChart : répertoire du widget pour le rank chart
  

# Définition : 
- **Energie primaire :** énergie n'ayant subi aucune transformation après extraction 
    (houille, lignite, pétrole brut, gaz naturel, électricité d'origine hydraulique, 
    nucléaire, éolienne, géothermique, etc.). 

# Technologies : 
- Python3
- D3JS
- Bootstrap
- Jquery

# Sources : 
- [Eider](http://www.stats.environnement.developpement-durable.gouv.fr/Eider/series.do#) pour les données
