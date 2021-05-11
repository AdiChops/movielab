let placeHere = `${location.protocol}//${location.hostname}${(location.port)?`:${location.port}`:''}`;

document.getElementById("submitReview").addEventListener("click", ()=>{
    let ratingV = document.getElementById("rating").value.trim();
    let summaryV = document.getElementById("reviewSummary").value.trim();
    let fullV = document.getElementById("fullReview").value.trim();
    let movId = document.getElementById("movieId").value;
    if(!ratingV  || ratingV == "" || isNaN(ratingV) || parseFloat(ratingV) > 10 || parseFloat(ratingV) < 0){
        document.getElementById("error").style.display = "block";
    }
    else if((fullV == "" && summaryV != "") || (fullV != "" && summaryV == "")){
        document.getElementById("error").innerHTML = '<span>&times;</span> If one of review summary or full review is filled out, other one must also be filled';
        document.getElementById("error").style.display = "block";
    }
    else{
        document.getElementById("error").style.display = "none";
        if(summaryV == "" && fullV == ""){
            summaryV = "N/A";
            fullV = "N/A";
        }
        let review = {
            rating: ratingV,
            summary: summaryV,
            fullReview: fullV
        };
        fetch(`${placeHere}/movies/${movId}/reviews`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(review)
        }).then((response)=>{
            return response.json();
        }).then((data)=>{
            console.log(data);
            if(data.status != 201){
                document.getElementById("error").innerHTML = `<span>&times;</span> ${data.error}`;
                document.getElementById("error").style.display = "block";
            }
            else{
                window.alert("Review added!");
                location.reload();
            }
        });
    }
});