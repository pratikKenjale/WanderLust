const apiKey = 'pk.888e4523ae15a9ca48d8cb6d35946124';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('listingForm');

  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    const location = document.getElementById('location').value;

    try {
      const response = await fetch(`https://us1.locationiq.com/v1/search?key=${apiKey}&q=${location}&format=json`);
      const data = await response.json();

      const lat = data[0]?.lat;
      const lon = data[0]?.lon;

      if (!lat || !lon) {
        alert("Location not found. Please try again.");
        return;
      }

      console.log("Appending coordinates:", lat, lon); // ✅ Debug line

      const latInput = document.createElement("input");
      latInput.type = "hidden";
      latInput.name = "latitude";
      latInput.value = lat;

      const lonInput = document.createElement("input");
      lonInput.type = "hidden";
      lonInput.name = "longitude";
      lonInput.value = lon;

      form.appendChild(latInput);
      form.appendChild(lonInput);

      form.submit();
    } catch (err) {
      console.error("Geocoding failed:", err);
      alert("Unable to geocode location.");
    }
  });
});



