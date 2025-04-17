setTimeout(function() {
    var alerts = document.querySelectorAll('.alert');
    alerts.forEach(function(alert) {
      alert.classList.add('fade');
      setTimeout(function() {
        alert.remove();
      }, 500); 
    });
  }, 2000);

 // Function to toggle the sidebar visibility
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  sidebar.classList.toggle('show');
}