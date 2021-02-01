$(document).ready(function () {
  topSearch();

  let artistStorage = JSON.parse(localStorage.getItem("artist")) || [];
  if (artistStorage.length) {
    let artist = artistStorage[artistStorage.length - 1].artist;

    $("#artist-search").val(artist);
    getArtistBio(artist);
    lastFMtracks(artist);
  }
});

function topSearch() {
  //On Search, artist picture shows up and history shows up.

  const artistSearch = $("#artist-search");
  $("#search-icon").on("click", function (event) {
    let art = artistSearch.val();
    event.preventDefault();
    getArtistBio(art);
    lastFMtracks(art);
    storeArtist(art);
  });

  $("#show-all-albums").on("click", function () {
    let art = artistSearch.val();
    getArtistDiscography(art);
  });

  $("#show-bio").on("click", function () {
    let art = artistSearch.val();
    getArtistBio(art);
  });

  $("#songs-videos").on("click", function () {
    let art = artistSearch.val();
    lastFMtracks(art);
  });

  $("input").keypress(function (event) {
    if (event.which == 13) {
      let art = artistSearch.val();
      event.preventDefault();
      getArtistBio(art);
      lastFMtracks(art);
      storeArtist(art);
    }
  });
}

//This gets the artists bio.  It populates all the info to the right.
function getArtistBio(art) {
  // var art = artistSearch.val();
  var query = "https://theaudiodb.com/api/v1/json/523532/search.php?s=" + art;

  $.ajax({
    url: query,
    method: "GET",
  }).then(function (bio) {
    $(".history-discography-songs-populate").text(
      bio.artists[0].strBiographyEN
    );

    //shows artist name
    $("#artist-name").text(bio.artists[0].strArtist);
    //Artist Image in ID class
    $("#artist-pic").attr("src", bio.artists[0].strArtistThumb);

    $("#show-artist-website").attr(
      "href",
      "http://" + bio.artists[0].strWebsite
    );
    $(".show-artist-web-name").text(bio.artists[0].strWebsite);
  });
}

//This will search for the discography.
function getArtistDiscography(art) {
  $(".history-discography-songs-populate").empty();

  // var art = artistSearch.val();
  let query =
    "https://theaudiodb.com/api/v1/json/523532/searchalbum.php?s=" + art;

  $.ajax({
    url: query,
    method: "GET",
  }).then(function (disco) {
    disco = disco.album
    console.log(disco);
    function compare( a, b ) { // a = disco[i] b = disco[i + 1]
      if (a.intYearReleased == 0) {
        return 1;
      } 
      if ( a.intYearReleased < b.intYearReleased ){
        return -1;
      }
      if ( a.intYearReleased > b.intYearReleased ){
        return 1;
      }
      return 0;
    }
    
    disco.sort( compare );

    for (let i = 0; i < disco.length; i++) {
      const element = disco[i];

      let thumb = element.strAlbumThumb;
      let albumName = element.strAlbum;
      let yearRel = element.intYearReleased;
      let alDesc = element.strDescriptionEN

      let img_src;
      if (thumb) {
        img_src = thumb;
      } else {
        img_src = "assets/cdcase.png";
      }

      $(".history-discography-songs-populate").append(
        '<div class="row"><img class="album-art-thumb" src="' +
          img_src + '"/><span id="disco_text">' + albumName + "&nbsp" + yearRel + '</span></div>'
      );
    }
  });
}

function lastFMtracks(art) {
  $(".history-discography-songs-populate").empty();

  var query =
    "https://ws.audioscrobbler.com/2.0/?method=artist.gettoptracks&artist=" +
    art +
    "&api_key=86378c0c44efeb81ab024beb87162a1b&format=json";

  $.ajax({
    url: query,
    method: "GET",
  }).then(function (topTracks) {
    const trackPath = topTracks.toptracks.track;
    $(".history-discography-songs-populate").append('<h1>Top 50 Songs</h1>');
    for (var i = 0; i < trackPath.length; i++) {
      let trackName = trackPath[i].name;
      $(".history-discography-songs-populate").append(
        `<li class="song" onclick="youtubeCall('` +
          trackName.replace(/["']/g, "") +
          `')" id="` +
          trackName.replace(/["']/g, "") +
          `"><span class="trackText">` +
          trackName +
          `</span></li>`
      );
    }
  });
  //  data-toggle="modal" data-target="#myModal"
  // $(".history-discography-songs-populate").on("click", "li", function () {
  //   let songTitle = $(this).text();

  //   youtubeCall(songTitle);
  // });
}

function youtubeCall(songTitle) {
  var songName = songTitle;
  var queryUrl =
    "https://youtube.googleapis.com/youtube/v3/search?part=snippet&maxResults=4&q=" +
    songName +
    "&videoEmbeddable=any&key=AIzaSyBNhOarkazaM-HMev-Dj-oa3IuWr5dzItU";

  $.ajax({
    // this is a call to get videoif from the trackName from the audiodb API, from the Youtube API
    url: queryUrl,
    method: "GET",
  }).then(function (response) {
    // debugger;

    var idVideo = response.items[0].id.videoId;
    console.log(idVideo);

    var videoAtt = "https://www.youtube.com/embed/" + idVideo;

    // $('#player').attr('src', videoAtt); // should attached the src attribute to the youtube player and play video. again will need possible for each statement

    var $videoSrc = videoAtt;
    // $('.video-btn').click(function() {
    //     $videoSrc = $(this).data( "src" );
    // });
    console.log($videoSrc);

    $("#myModal").modal();
    $("#" + songTitle).click(function () {
      console.log("show modal");
      $("#myModal").modal("show");
    });

    // when the modal is opened autoplay it
    $("#myModal").on("shown.bs.modal", function (e) {
      // set the video src to autoplay and not to show related video. Youtube related video is like a box of chocolates... you never know what you're gonna get
      $("#video").attr(
        "src",
        $videoSrc + "?autoplay=1&amp;modestbranding=1&amp;showinfo=0"
      );
    });

    // stop playing the youtube video when I close the modal
    $("#myModal").on("hide.bs.modal", function (e) {
      // a poor man's stop video
      $("#video").attr("src", $videoSrc);
    });
  });
}

function storeArtist(artist) {
  let artistStorage = JSON.parse(localStorage.getItem("artist")) || [];
  let a = {
    artist,
  };

  artistStorage.push(a);
  localStorage.setItem("artist", JSON.stringify(artistStorage));
}
