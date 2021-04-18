document.getElementById("submitFullReview").addEventListener("click", ()=>{
    let ratingV = document.getElementById("rating").value;
    let summaryV = document.getElementById("reviewSummary").value;
    let fullV = document.getElementById("fullReview").value;
    let movId = document.getElementById("movieId").value;
    if(!ratingV || !summaryV || !fullV || ratingV == "" || summaryV == "" || fullV == "" || isNaN(ratingV) || parseFloat(ratingV) > 10 || parseFloat(ratingV) < 0){
        document.getElementById("error").style.display = "block";
    }
    else{
        document.getElementById("error").style.display = "none";
        let review = {
            rating: ratingV,
            summary: summaryV,
            fullReview: fullV
        };
        fetch(`http://localhost:3000/movies/${movId}/reviews`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(review)
        }).then((response)=>{
            return response.json();
        }).then((data)=>{
            console.log(data);
            if(data.status != 200){
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