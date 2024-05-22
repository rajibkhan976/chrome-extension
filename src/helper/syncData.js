export const ChangeData = (item, level, val) => {
  if (level === 0) {
    return { ...item, value: val, valid: true };
  }
  return {
    ...item,
    fieldOptions: [ChangeData(item.fieldOptions[0], level - 1, val)],
  };
};

const FindData = (child, parent, level) => {
  if (!parent.fieldOptions) {
    return false;
  }
  const mainData = parent.fieldOptions[0];
  if (child.name === mainData.name) {
    return level;
  } else {
    return FindData(child, mainData, level + 1);
  }
};

/**
 * SETTINGS SYNC FOR MODERN FORM AND NEWLY ADDED..
 * @param {*} apiObj 
 * @param {*} uiObj 
 * @param {*} setUiObj 
 */
export const syncFromNewAPi = (apiObj, uiObj, setUiObj) => {
  const newFromObj = { ...uiObj };

  console.log("API keys and ui Obj NEW - ", apiObj, uiObj);

  Object.entries(apiObj).forEach(([apiKey, apiValue]) => {
    for (const i in newFromObj.fields) {
      const fieldItem = newFromObj.fields[i];

      if (fieldItem.name === "lookup_for_mutual_friend") {
        fieldItem?.fieldOptions?.map(field => {
          if (field?.name === "mutual_friend_value") {
            if (apiObj?.mutual_friend_value?.trim() === "") {
              field.value = "10";
            }

            return field;
          }
        });
      }

      if (fieldItem.name === "given_reactions") {
        fieldItem?.fieldOptions?.map(reactionItemms => {
          if (reactionItemms.name === "reaction") {

            reactionItemms?.options?.map(item => {
              if (item.name === "reaction_type") {
                item.isActive = apiObj?.reaction;
                item.value = apiObj?.reaction_type;
              }

              if (item.name === "comment") {
                item.isActive = apiObj?.comment;
              }

              return item;
            })
          }

          return reactionItemms;
        });
      }


      if (fieldItem.name === apiKey) {
        fieldItem.isActive = apiValue;

        console.log("newFormObj - before - ", newFromObj.fields[i], fieldItem, i);

        newFromObj.fields[i] = fieldItem;
        break;

      } else {
        if (fieldItem.recursive) {
          // console.log("NAME - ", apiKey);
          const found = FindData({ name: apiKey }, fieldItem, 1);
          // console.log("is recursive:::");
          if (found) {
            const newObj = ChangeData(fieldItem, found, apiValue);
            newFromObj.fields[i] = newObj;
            break;
          }

        } else {

          const newObj = {
            ...fieldItem,
            fieldOptions: fieldItem.fieldOptions.map((itemCh) => {
              if (apiKey === itemCh.name) {
                if (
                  itemCh.type === "fillinput" ||
                  itemCh.type === "fillinputCF" ||
                  itemCh.type === "selectInput"
                ) {
                  // console.log("split case api value", apiValue);
                  itemCh.valueArr = apiValue;
                  itemCh.valid = true;

                } else if (itemCh.name === "country_filter") {
                  if (apiValue === true) {
                    itemCh.value = "Country Level";
                    itemCh.valid = true;

                  } else {
                    itemCh.value = "Tier Level";
                    itemCh.valid = true;
                  }

                } else {
                  itemCh.value = apiValue;
                  itemCh.valid = true;
                }

                // itemCh.value = apiValue;
              }

              console.log("returned the value - ", itemCh);
              return itemCh;
            }),
          };

          console.log("NewObj - ", newObj);
          newFromObj.fields[i] = newObj;
        }
      }
    }
  });
  console.log("NEWWW ", newFromObj);
  setUiObj(newFromObj);
};

export const syncFromApi = (apiObj, uiObj, setUiObj) => {
  // var startTime = performance.now();
  // console.log("sycning started......before obj", uiObj);
  const newFromObj = { ...uiObj };

  console.log("API keys and ui Obj - ", apiObj, uiObj);

  Object.entries(apiObj).forEach(([apiKey, apiValue]) => {
    for (const i in newFromObj.fields) {
      const fieldItem = newFromObj.fields[i];
      if (fieldItem.name === apiKey) {
        fieldItem.isActive = apiValue;

        newFromObj.fields[i] = fieldItem;
        break;

      } else {
        if (fieldItem.recursive) {
          // console.log("NAME - ", apiKey);
          const found = FindData({ name: apiKey }, fieldItem, 1);
          // console.log("is recursive:::");
          if (found) {
            const newObj = ChangeData(fieldItem, found, apiValue);
            newFromObj.fields[i] = newObj;
            break;
          }

        } else {

          const newObj = {
            ...fieldItem,
            fieldOptions: fieldItem.fieldOptions.map((itemCh) => {
              if (apiKey === itemCh.name) {
                if (
                  itemCh.type === "fillinput" ||
                  itemCh.type === "fillinputCF" ||
                  itemCh.type === "selectInput"
                ) {
                  // console.log("split case api value", apiValue);
                  itemCh.valueArr = apiValue;
                  itemCh.valid = true;

                } else if (itemCh.name === "country_filter") {
                  if (apiValue === true) {
                    itemCh.value = "Country Level";
                    itemCh.valid = true;

                  } else {
                    itemCh.value = "Tier Level";
                    itemCh.valid = true;
                  }

                } else if (itemCh.name === "mutual_friend_value") {
                  itemCh.value = apiValue;
                  itemCh.valid = true;

                } else {
                  itemCh.value = apiValue;
                  itemCh.valid = true;
                }

                // itemCh.value = apiValue;
              }
              return itemCh;
            }),
          };
          newFromObj.fields[i] = newObj;
        }
      }
    }
  });
  console.log(">>>>+++=====---=========;;;;newFromObj end ????", newFromObj);
  setUiObj(newFromObj);
  // var endTime = performance.now();
  // console.log(
  //   `Total execution time of sycing  function:::[${
  //     endTime - startTime
  //   }]milliseconds`
  // );
};

export const syncPayload = (apiObj, payloadObj, setPayload) => {
  // console.log("payload sync started", payloadObj);
  const newObj = { ...payloadObj };
  Object.entries(newObj).forEach(([key]) => {
    newObj[key] = apiObj[key];
  });

  // console.log("payload sync ended", newObj);
  setPayload(newObj);
};
const FindInValid = (data) => {
  if (!data.fieldOptions) {
    return false;
  }
  const mainData = data.fieldOptions[0];
  if (!mainData.valid) {
    return true;
  } else {
    return FindInValid(mainData);
  }
};

const FindValidInRec = (data) => {
  // console.log("*********************", data, data.fieldOptions)
  if (!data.fieldOptions) {
    return { obj: data, unValid: false };
  }
  const mainData = data.fieldOptions[0];
  if (mainData.value <= 0 || mainData.value.length === 0 || !mainData.valid) {
    mainData.valid = false;
    return { obj: { ...data, fieldOptions: [{ ...mainData }] }, unValid: true };
  } else {
    return FindValidInRec(mainData);
  }
};


/**
 * CHECK VALIDATION FUNCTION
 * @param {*} dataObj 
 * @param {*} setdata 
 * @returns 
 */
export const checkValidity = (dataObj, setdata) => {
  //console.log("direct data obj:____>>", dataObj);
  let time = 0;
  let reason = "Invalid input field"
  let valid = true;
  let data = { ...dataObj };

  for (const fidx in data.fields) {

    if (data.fields[fidx].name === "send_message_when_friend_request_sent") {
      data.fields[fidx].fieldOptions?.map(option => {
        if (option?.name === "send_message_when_friend_request_sent_message_group_id") {
          if (data?.fields[fidx]?.isActive === true && option?.options?.length <= 0 || option?.value === "") {
            // option.valid = false;
            valid = false;
          }

          const foundMessageGroup = option.options.find(item => item.value === option.value);

          // undefined if no any groups
          if (data?.fields[fidx]?.isActive === true && option?.options?.length > 0 && foundMessageGroup === undefined) {
            option.valid = false;
            valid = false;
          }
        }
      });
    }


    if (data.fields[fidx].name === "send_message_when_friend_request_accepted") {
      data.fields[fidx].fieldOptions?.map(option => {
        if (option?.name === "send_message_when_friend_request_accepted_message_group_id") {
          if (data?.fields[fidx]?.isActive === true && option?.options?.length <= 0 || option?.value === "") {
            // option.valid = false;
            valid = false;
          }

          const foundMessageGroup = option.options.find(item => item.value === option.value);

          // undefined if no any groups
          if (data?.fields[fidx]?.isActive === true && option?.options?.length > 0 && foundMessageGroup === undefined) {
            option.valid = false;
            valid = false;
          }
        }
      });
    }


    if (data.fields[fidx].name === "given_reactions") {
      data.fields[fidx]?.fieldOptions?.map(option => {
        if (option?.name === "reaction") {
          option?.options?.map(reaction => {
            if (reaction?.name === "reaction_type") {
              if (reaction.isActive === true && reaction.value?.length === 0) {
                reaction.valid = false;
                valid = false;
              }
            }
          })
        }
      })
    }

    if (data.fields[fidx].name === "lookup_for_mutual_friend") {
      data.fields[fidx]?.fieldOptions?.map(option => {
        if (option?.name === "mutual_friend_value") {
          const isActiveSetting = data?.fields[fidx]?.isActive;

          if (isActiveSetting) {
            if (option?.value === "" || option?.value?.length < 1) {
              option.valid = false;
              valid = false;
            }

            if (parseInt(option?.value) <= 0) {
              option.valid = false;
              valid = false;
            }
          }
        }
      });
    }

    if (data.fields[fidx].headerCheckbox) {
      if (data.fields[fidx].isActive) {
        if (data.fields[fidx].recursive) {
          const recValue = FindValidInRec(data.fields[fidx]);
          if (recValue.unValid) {
            valid = false;
            //console.log(recValue);
            data.fields[fidx] = recValue.obj;
          }
        } else {
          for (const chidx in data.fields[fidx].fieldOptions) {
            if (data.fields[fidx].name === "country_filter_enabled") {
              if (data.fields[fidx].fieldOptions[0].value === "Tier Level") {
                if (
                  data.fields[fidx].fieldOptions[chidx].name ===
                  "tier_filter_value" &&
                  data.fields[fidx].fieldOptions[chidx]?.value.length === 0
                ) {
                  valid = false;
                  data.fields[fidx].fieldOptions[chidx].valid = false;
                }
              } else if (
                data.fields[fidx].fieldOptions[0].value === "Country Level"
              ) {
                if (
                  data.fields[fidx].fieldOptions[chidx].name ===
                  "country_filter_value" &&
                  data.fields[fidx].fieldOptions[chidx].valueArr.length === 0
                ) {
                  valid = false;
                  data.fields[fidx].fieldOptions[chidx].valid = false;
                }
              }
            } else {
              if (
                data.fields[fidx].fieldOptions[chidx].valueArr &&
                data.fields[fidx].fieldOptions[chidx].valueArr.length === 0
              ) {
                valid = false;
                data.fields[fidx].fieldOptions[chidx].valid = false;
              }
            }
          }
        }
      }
    } else {
      if (data.fields[fidx].recursive) {
        if (
          data.fields[fidx].fieldOptions[0].value === "Limited"
        ) {

          const recValue = FindValidInRec(data.fields[fidx]);
          if (recValue.unValid) {
            valid = false;
            //console.log(recValue);
            //data.fields[fidx] = recValue.obj;
          }
        }
      } else {
        for (const chidx in data.fields[fidx].fieldOptions) {
          if (!data.fields[fidx].fieldOptions[chidx].valid) {
            valid = false;
          }
        }
      }
    }
  }
  setdata(data);
  return { valid: valid, errReason: reason };
};

export const removeEle = (mainObj, removeArr) => {
  return new Promise((resolve, reject) => {
    const newObj = { ...mainObj };
    for (const item of removeArr) {
      delete newObj[item];
    }
    resolve(newObj);
  });
};
export const createApiPayload = (apiObj, uiObj) => { };

export function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
