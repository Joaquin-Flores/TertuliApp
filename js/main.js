$(document).ready(function() {
    // Event Creation Form
    $("#eventForm").submit(function(event) {
        event.preventDefault(); // Prevent the default form submission

        // Get form values
        var eventName = $("#eventName").val();
        var eventDate = $("#eventDate").val();
        var eventTime = $("#eventTime").val();

        // Generate event link (basic for now)
        var eventLink = generateEventLink(eventName, eventDate, eventTime);

        // Display event link
        $("#eventURL").attr("href", eventLink).text(eventLink);
        $("#eventLink").show(); // Show the event link section

        // Save event data
        saveEventData(eventName, eventDate, eventTime);

        // Calculate and Display Best Time (Placeholder)
        calculateBestTime();

        // Clear the form
        $("#eventForm")[0].reset();
    });

    function generateEventLink(eventName, eventDate, eventTime) {
        // Simple link generation for now
        const baseURL = window.location.origin + window.location.pathname;
        const link = `${baseURL}?event=${encodeURIComponent(eventName)}&date=${encodeURIComponent(eventDate)}&time=${encodeURIComponent(eventTime)}`;
        return link;
    }

    function saveEventData(eventName, eventDate, eventTime) {
        const eventData = {
            eventName: eventName,
            eventDate: eventDate,
            eventTime: eventTime
        };

        // For now, just log the event data
        console.log("Saving event data:", eventData);

        // In a real application, you would:
        // 1. Read the contents of events.json
        // 2. Parse it as JSON (or initialize an empty array if the file is empty)
        // 3. Push the eventData object to the array
        // 4. Stringify the array back to JSON
        // 5. Write the JSON string back to events.json
    }

    // Participant Availability Input
    $("#addAvailability").click(function() {
        var availability = $("#availability").val();
        if (availability.trim() !== "") {
            // Add the availability to the list
            $("#availabilityList").append("<li>" + availability + "</li>");
            $("#availability").val(""); // Clear the input field
        }
    });

    // Placeholder for Best Time Calculation
    function calculateBestTime() {
        // In a real application, you would:
        // 1. Get the event data and participant schedules.
        // 2. Analyze the schedules to find the best time.
        // 3. Display the best time in the #bestTimeDisplay element.
        $("#bestTimeDisplay").text("Best time calculation is not yet implemented.");
        $("#bestTime").show();
    }
});
