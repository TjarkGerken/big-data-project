export default function sendDemoRequest() {
    function sendReq(){
        console.log("Sending Request")
    }

    return(
<div className={"bg-spotify-green text-spotify-black rounded-full px-8 py-4 text-center font-bold text-xl"}>
    <button onClick={sendReq}>Authorize with your Spotify Account</button>
</div>)}