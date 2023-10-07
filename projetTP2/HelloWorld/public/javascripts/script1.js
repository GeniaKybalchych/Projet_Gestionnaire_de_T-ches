$(document).ready(function() {
    $('#data-form').on('submit', function(e) {
        e.preventDefault();

        var data = {
            name: $('#name').val(),
            description: $('#description').val(),
            dueDate: $('#dueDate').val(),
            createdDate: $('#createdDate').val(),
            completed: $('#completed').is(':checked')
        };

        $.ajax({
            url: '/taches',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(data),
            success: function(response) {
                alert('Tâche ajoutée avec succès!');
            },
            error: function(error) {
                console.log(error);
                alert('Erreur lors de l\'ajout de la tâche!');
            }
        });
    });
});