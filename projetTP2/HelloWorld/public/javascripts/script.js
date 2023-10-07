//Visualisation
const margin = { top: 10, right: 30, bottom: 200, left: 40 };
const width = 1000 - margin.left - margin.right;
const height = 500 - margin.top - margin.bottom;

const svg = d3
  .select("#chart-container")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom);


const x = d3.scaleBand().range([0, width]).padding(0.1);
const y = d3.scaleLinear().range([height, 0]);

//Récupérer les données
fetch("/taches")
  .then((response) => response.json())
  .then((data) => {
    // Convertir les chaînes de date en objets Date JavaScript
    data.forEach((d) => {
      d.createdDate = new Date(d.createdDate);
      d.dueDate = new Date(d.dueDate);

      let today = new Date();
      d.value = (d.dueDate - today) / (1000 * 60 * 60 * 24);
      if (isNaN(d.value)) {
        d.value = 0; // Attribuer une valeur par défaut en cas de NaN
      }
    });

    console.log(data); // Pour vérifier que les transformations sont correctes

    // Les domaines des échelles
    x.domain(
      data.map(function (d) {
        return d.name;
      })
    );
    y.domain([
      0,
      d3.max(data, function (d) {
        return d.value;
      }),
    ]);
   

    // Création d'un groupe (g) pour le graphique
    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

   
    
    // Ajout des axes X et Y
    g.append("g")
      .attr("class", "axis")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("class", "axis-label")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", "5em")
      .attr("transform", "rotate(-45)");

    g.append("g")
      .attr("class", "axis")
      .call(d3.axisLeft(y))
      .append("text")
      .attr("class", "axis-label")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", "0.71em")
      .attr("text-anchor", "end")
      .text("Valeur");

// Ajout des barres au graphique avec un groupe contenant la barre et le bouton
const bars = g
.selectAll(".bar-group")
.data(data)
.enter()
.append("g")
.attr("class", "bar-group")
.attr("transform", (d) => `translate(${x(d.name)}, 0)`);


bars
.append("rect") .attr("class", (d) => (d.completed ? "bar completed" : "bar"))
.attr("y", function (d) {
  return y(Math.max(0, d.value));
}) // Assurer que y ne reçoit pas de valeurs négatives
.attr("width", x.bandwidth())
.attr("height", function (d) {
  return height - y(Math.max(0, d.value));
}); // Assurer que la hauteur est au minimum 0

//L'ajout de text pour la Suppression
bars
    .append("text")
    .attr("class", "toggle-button")
    .attr("x", x.bandwidth() / 2)
    .attr("y", height + 40)  
    .attr("text-anchor", "middle")
    .text("Supprimer")
    .on("click", function(event, d) {
        // Demande d' une confirmation avant de supprimer la tâche
        const userConfirmed = window.confirm("Êtes-vous sûr de vouloir supprimer cette tâche ?");
        if (userConfirmed) {
            deleteTask(d._id, this);
        }
    });

//L'ajout de text pour la Modification du statut
bars
.append("text")
.attr("class", "toggle-button")
.attr("x", x.bandwidth() / 2)
.attr("y", height + 20)
.attr("text-anchor", "middle")
.text((d) => (d.completed ? "Terminé" : "Non Terminé"))
.on("click", function (event, d) {
  d.completed = !d.completed; // changer l'état de completion
  updateTask(d._id, { completed: d.completed }); // mettre à jour la tâche dans la base de données
  
  // Mettre à jour la classe de la barre pour refléter l'état de completion
  d3.select(this.parentNode) 
    .select(".bar") 
    .attr("class", d.completed ? "bar completed" : "bar"); 
  
  d3.select(this).text(d.completed ? "Terminé" : "Non Terminé"); 
});
  })
  
  function deleteTask(id, element) {
    fetch(`/taches/${id}`, {
        method: 'DELETE',
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.json();
    })
    .then(data => {
        console.log('Success:', data);
           // Supprimez la barre du graphique
           d3.select(element.parentNode).remove();
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}

  function updateTask(id, updates) {
    fetch(`/taches/${id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
    })
    .then(response => {
        if (!response.ok) {
            return Promise.reject('Failed to update task, status: ' + response.status);
        }
        return response.json();
    })
    .then(data => {
        console.log('Success:', data);
    })
    .catch((error) => console.error("Erreur:", error));
   
    console.log(`Sending PATCH request to /taches/${id} with data:`, JSON.stringify(updates, null, 2));
    console.log('Request body:', JSON.stringify(updates, null, 2));

    
}
