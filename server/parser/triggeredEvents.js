
function triggeredEvent(unparsedEvent, finalObject){
    console.log("triggered")
    finalObject.event = unparsedEvent;
}

module.exports = {triggeredEvent};