
  /**
   * Function to generate the message
   * @param {*} message
   * @param {*} friendFbId
   * @param {*} userId
   * @returns
   */
  const generateMessage = (message, friendInfo) => {
    let outputString = message.replace(/{{([^}]+)}}/g, (_, msgString) =>
      replaceMergeFields(`{{${msgString}}}`, friendInfo)
    );
    // Spintax Use regular expressions to find and replace the content within {hi|hello}
    outputString = outputString.replace(/{([^}]+)}/g, (_, match) =>
      replaceGreeting(["", match])
    );
    return outputString;
  };
  
  // Function to replace the content within { } with a random value
  function replaceGreeting(match) {
    const greetings = match[1].split("|");
    const randomIndex = Math.floor(Math.random() * greetings.length);
    return greetings[randomIndex];
  }
  // Function to replace merge fields
  function replaceMergeFields(match, friendInfo) {
    // find the match keys
    const matchedKey = match.replace(/{{|}}/g, "");
    if (matchedKey === "friendName" && friendInfo.friendName) {
      return friendInfo.friendName;
    }
    if (matchedKey ==="friendShortName" && friendInfo.friendName) {
      const sortName = friendInfo.friendName.split(' ');
      return sortName[0];
    }
    if (matchedKey === "friendGender" && friendInfo.gender) {
      return friendInfo.gender;
    }
    if (matchedKey === "country" && friendInfo.country) {
      return friendInfo.country;
    }
    if (matchedKey === "tier" && friendInfo.tier) {
      return friendInfo.tier;
    }
    if (matchedKey === "groupName" && friendInfo.groupName) {
      return friendInfo.groupName;
    }
    if (matchedKey === "Keyword" && friendInfo.Keyword) {
      return friendInfo.Keyword;
    }
    // Return an empty string if no matching condition is found
    return "";
  }

  export default generateMessage