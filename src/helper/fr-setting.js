//import { getKeyWords } from "../service/FriendRequest";
import { country_list, demo_list, tier_list } from "./helper";

// export const keywordObj = () => {
//   const keywords = getKeyWords();
//   keywords
//     .then((res) => {
//        // console.log("hii data respw:", res);
//       return res.data;
//     })
//     .catch((err) => {
//        // console.log("Error in fetching keyword API", err);
//       return [];
//     });
// };

//::::::Never Delete any comment from this file:::::::

export const requestFormSettings = {
  label: "Settings",
  uniqueId: "generalSettings",
  name: "settings",
  method: null,
  id: "generalSettings",
  action: null,
  autocomplete: "off",
  fields: [
    {
      label: "Look up interval",
      headerCheckbox: false,
      recursive: true,
      valid: true,
      fieldOptions: [
        {
          type: "select",
          name: "look_up_interval",
          value: "auto",
          isLabeled: false,
          valid: true,
          options: [
            {
              label: "Auto(15-18 sec)",
              value: "auto",
            },
            {
              label: "30 sec",
              value: ".5",
            },
            {
              label: "1 min",
              value: "1",
            },
            {
              label: "3 min",
              value: "3",
            },
            {
              label: "5 min",
              value: "5",
            },
            {
              label: "10 min",
              value: "10",
            },
            {
              label: "15 min",
              value: "15",
            },
          ],
        },
      ],
    },
    {
      label: "Request Limit",
      headerCheckbox: false,
      recursive: true,
      valid: true,
      fieldOptions: [
        {
          type: "radio",
          isLabeled: false,
          valid: true,
          name: "request_limit_type",
          value: "Infinite",
          options: [
            {
              text: "Infinite",
            },
            {
              text: "Limited",
            },
           
          ],

          fieldOptions: [
            {
              type: "stepInput",
              name: "request_limit",
              isLabeled: true,
              valid: true,
              inLabel: "Number of request",
              value: 50,
            },
          ],
        },
      ],
    },
    // {
    //   label: "Look Up for Mutual friends?",
    //   headerCheckbox: true,
    //   recursive: true,
    //   valid: true,
    //   fieldOptions: [
    //     {
    //       type: "radioSml",
    //       isLabeled: false,
    //       name: "look_up_mutual_friend",
    //       valid: true,
    //       value: "No",
    //       options: [
    //         {
    //           text: "Yes",
    //         },
    //         {
    //           text: "No",
    //         },
    //       ],
    //       fieldOptions: [
    //         {
    //           type: "select",
    //           isLabeled: true,
    //           inLabel: "Mutual friends",
    //           valid: true,
    //           value: "less_than",
    //           name: "mutual_friends_condition",
    //           options: [
    //             {
    //               selected: true,
    //               value: "equals",
    //               label: "Equals to",
    //             },
    //             {
    //               selected: false,
    //               value: "less_than",
    //               label: "Less than",
    //             },
    //             {
    //               selected: false,
    //               value: "more_than",
    //               label: "More than",
    //             },
    //           ],
    //           fieldOptions: [
    //             {
    //               type: "input",
    //               name: "mutual_friends_value",
    //               valid: true,
    //               isLabeled: true,
    //               inLabel: "up to",
    //               value: "",
    //             },
    //           ],
    //         },
    //       ],
    //     },
    //   ],
    // },
    {
      label: "Gender filter",
      headerCheckbox: true,
      recursive: true,
      name: "gender_filter",
      isActive: false,
      valid: true,
      fieldOptions: [
        {
          type: "select",
          isLabeled: false,
          valid: true,
          name: "gender_filter_value",
          value: "male",
          options: [
            {
              selected: true,
              label: "Male",
              value: "male",
            },
            {
              selected: false,
              label: "Female",
              value: "female",
            },
            {
              selected: false,
              label: "Others",
              value: "others",
            },
          ],
        },
      ],
    },
    {
      label: "Country Filter",
      headerCheckbox: true,
      isActive: false,
      recursive: false,
      valid: true,
      name: "country_filter_enabled",
      fieldOptions: [
        {
          type: "radio",
          isLabeled: false,
          valid: true,
          name: "country_filter",
          value: "Tier Level",
          options: [
            {
              text: "Tier Level",
            },
            {
              text: "Country Level",
            },
          ],
        },
        {
          type: "stepInput",
          isLabeled: true,
          inLabel: "Select Tier",
          valid: true,
          name: "tier_filter_value",
        //sggArray: tier_list,
        //valueArr: [],
          value:1,
        },
        {
          type: "fillinputCF",
          isLabeled: true,
          inLabel: "Select Country",
          sggArray: country_list,
          valid: true,
          name: "country_filter_value",
          valueArr: [],
          value: "",
        },
      ],
    },
    {
      label: "Keywords",
      headerCheckbox: true,
      name: "keyword",
      recursive: false,
      valid: true,
      isActive: false,
      fieldOptions: [
        {
          type: "selectInput",
          isLabeled: true,
          valid: true,
          name: "selected_keywords",
          inLabel: "Title",
          value: "",
          valueArr: [],
          options: [],
        },
        {
          type: "fillinput",
          color: "#005911",
          valid: true,
          isLabeled: true,
          inLabel: "Select keywords",
          name: "selected_keywords",
          sggArray: [],
          valueArr: [],
          value: "",
        },
      ],
    },
    {
      label: "Negative Keywords",
      headerCheckbox: true,
      name: "negative_keyword",
      recursive: false,
      isActive: false,
      valid: true,
      fieldOptions: [
        {
          type: "selectInput",
          isLabeled: true,
          valid: true,
          inLabel: "Title",
          name: "selected_negative_keywords",
          fieldCount: 1,
          sggArray: [],
          valueArr: [],
          value: "",
          options: [],
        },
        {
          type: "fillinput",
          color: "#92000D",
          isLabeled: true,
          valid: true,
          inLabel: "Select keywords",
          sggArray: demo_list,
          fieldCount: 2,
          name: "selected_negative_keywords",
          valueArr: [],
          value: "",
        },
      ],
    },
    {
      label: "Resume from last search",
      headerCheckbox: true,
      name: "resume_last_search",
      recursive: true,
      valid: true,
      isActive: false,
      fieldOptions: [
        {
          type: "input",
          isLabeled: true,
          inLabel: "Your last search member's position",
          name: "resume_last_search_position",
          valid: true,
          value: "",
        },
      ],
    },
    {
      label: "Send message",
      headerCheckbox: true,
      name: "send_message",
      recursive: false,
      isActive: false,
      valid: true,
      fieldOptions: [
        {
          type: "select",
          isLabeled: false,
          valid: true,
          name: "send_message_value",
          value: "Please select the message",
          
          options: [
            // {
            //   selected: true,
            //   label: "message 1",
            //   value: "message_1",
            // },
            // {
            //   selected: false,
            //   label: "message 2",
            //   value: "message_2",
            // },
            // {
            //   selected: false,
            //   label: "message 3",
            //   value: "message_3",
            // },
          ],
        },
      ],
    },
  ],
};

export const requestFormAdvncSettings = {
  label: "Advance Settings",
  uniqueId: "advanceSettings",
  name: "Advance settings",
  method: null,
  id: "advanceSettings",
  action: null,
  autocomplete: "off",
  fields: [
    {
      label:
        "Don’t send friend requests to people I’ve been friends with before.",
      isActive: false,
    },
    {
      label:
        "Don’t send friend requests to people who sent me friend requests and I rejected.",
      isActive: false,
    },
    {
      label:
        "Don’t send friend requests to people I sent friend requests and they rejected.",
      isActive: false,
    },
    {
      label: "Send message when someone accept my friend request.",
      isActive: false,
      fieldOptions: [
        {
          label: "Select the message template you want to send",
          type: "select",
          selectValue: "Select the message",
          options: [
            {
              label: "Select the message",
              value: "Select the message",
            },
          ],
        },
        {
          label: "and then, the message will be sent after",
          type: "inputSelect",
          value: 1,
          selectValue: "days",
          options: [
            {
              label: "Days",
              value: "days",
            },
            {
              label: "Months",
              value: "months",
            },
            {
              label: "Years",
              value: "years",
            },
          ],
        },
      ],
    },
    {
      label: "Re-Friending",
      isActive: false,
      fieldOptions: [
        {
          label: "Remove pending friend request after",
          type: "inputSelect",
          value: 1,
          selectValue: "days",
          options: [
            {
              label: "Days",
              value: "days",
            },
            {
              label: "Months",
              value: "months",
            },
            {
              label: "Years",
              value: "years",
            },
          ],
        },
        {
          label:
            "and then, Instantly resend the friend request. I can set this to  ",
          type: "input",
          value: 1,
          suffix: "amount of times to Refriend",
        },
      ],
    },
  ],
};

export const fr_Req_Payload = {
  look_up_interval: "auto",
  request_limit_type: "Infinite",
  request_limit: 50,
  // look_up_mutual_friend: "No",
  // mutual_friends_condition: "less_than",
  // mutual_friends_value: "",
  gender_filter: false,
  gender_filter_value: "male",
  country_filter_enabled: false,
  country_filter: false,
  country_filter_value: [],
  tier_filter: false,
  tier_filter_value: [],
  keyword: false,
  selected_keywords: [],
  negative_keyword: false,
  selected_negative_keywords: [],
  resume_last_search: false,
  resume_last_search_position: "",
  advanced_settings: false,
  dont_send_friend_requests_prople_ive_been_friends_with_before: false,
  dont_send_friend_requests_prople_who_send_me_friend_request_i_rejected: false,
  dont_send_friend_requests_prople_i_sent_friend_requests_they_rejected: false,
  send_message_when_someone_accept_new_friend_request: false,
  send_message_when_someone_accept_new_friend_request_settings: {
    message_template_id: 14,
    send_message_time: 2,
    send_message_time_type: "days",
  },
  re_friending: false,
  re_friending_settings: {
    remove_pending_friend_request_after: 2,
    time_type: "days",
    instantly_resend_friend_request: 2,
  },
  save_settings_for_future_use: false,
  profile_viewed: 0,
  friend_request_send: 0,
  time_saved: 0,
};

export const defaultFormSettings = {
  label: "Settings",
  uniqueId: "generalSettings",
  name: "settings",
  method: null,
  id: "generalSettings",
  action: null,
  autocomplete: "off",
  fields: [
    {
      label: "Look up interval",
      headerCheckbox: false,
      recursive: true,
      valid: true,
      fieldOptions: [
        {
          type: "select",
          name: "look_up_interval",
          value: "1",
          isLabeled: false,
          valid: true,
          options: [
            {
              label: "Auto(15-18 sec)",
              value: "auto",
            },
            {
              label: "30 sec",
              value: ".5",
            },
            {
              label: "1 min",
              value: "1",
            },
            {
              label: "3 min",
              value: "1",
            },
            {
              label: "5 min",
              value: "5",
            },
            {
              label: "10 min",
              value: "10",
            },
            {
              label: "15 min",
              value: "15",
            },
          ],
        },
      ],
    },
    {
      label: "Request Limit",
      headerCheckbox: false,
      recursive: true,
      valid: true,
      fieldOptions: [
        {
          type: "radio",
          isLabeled: false,
          valid: true,
          name: "request_limit_type",
          value: "Infinite",
          options: [
            {
              text: "Limited",
            },
            {
              text: "Infinite",
            },
          ],

          fieldOptions: [
            {
              type: "input",
              name: "request_limit",
              isLabeled: true,
              valid: true,
              inLabel: "up to",
              value: "",
            },
          ],
        },
      ],
    },
    // {
    //   label: "Look Up for Mutual friends?",
    //   headerCheckbox: false,
    //   recursive: true,
    //   valid: true,
    //   fieldOptions: [
    //     {
    //       type: "radioSml",
    //       isLabeled: false,
    //       name: "look_up_mutual_friend",
    //       valid: true,
    //       value: "No",
    //       options: [
    //         {
    //           text: "Yes",
    //         },
    //         {
    //           text: "No",
    //         },
    //       ],
    //       fieldOptions: [
    //         {
    //           type: "select",
    //           isLabeled: true,
    //           inLabel: "Mutual friends",
    //           valid: true,
    //           value: "less_than",
    //           name: "mutual_friends_condition",
    //           options: [
    //             {
    //               selected: true,
    //               value: "equals",
    //               label: "Equals to",
    //             },
    //             {
    //               selected: false,
    //               value: "less_than",
    //               label: "Less than",
    //             },
    //             {
    //               selected: false,
    //               value: "more_than",
    //               label: "More than",
    //             },
    //           ],
    //           fieldOptions: [
    //             {
    //               type: "input",
    //               name: "mutual_friends_value",
    //               valid: true,
    //               isLabeled: true,
    //               inLabel: "up to",
    //               value: 1,
    //             },
    //           ],
    //         },
    //       ],
    //     },
    //   ],
    // },
    {
      label: "Gender filter",
      headerCheckbox: true,
      recursive: true,
      name: "gender_filter",
      isActive: false,
      valid: true,
      fieldOptions: [
        {
          type: "select",
          isLabeled: false,
          valid: true,
          name: "gender_filter_value",
          value: "male",
          options: [
            {
              selected: true,
              label: "Male",
              value: "male",
            },
            {
              selected: false,
              label: "Female",
              value: "female",
            },
            {
              selected: false,
              label: "Others",
              value: "others",
            },
          ],
        },
      ],
    },
    {
      label: "Country Filter",
      headerCheckbox: true,
      isActive: false,
      recursive: false,
      valid: true,
      name: "country_filter_enabled",
      fieldOptions: [
        {
          type: "radio",
          isLabeled: false,
          valid: true,
          name: "country_filter",
          value: "Tier Level",
          options: [
            {
              text: "Tier Level",
            },
            {
              text: "Country Level",
            },
          ],
        },
        {
          type: "fillinputCF",
          isLabeled: true,
          inLabel: "Select Tier",
          valid: true,
          name: "tier_filter_value",
          sggArray: tier_list,
          valueArr: [],
          value: "",
        },
        {
          type: "fillinputCF",
          isLabeled: true,
          inLabel: "Select Country",
          sggArray: country_list,
          valid: true,
          name: "country_filter_value",
          valueArr: [],
          value: "",
        },
      ],
    },
    {
      label: "Keywords",
      headerCheckbox: true,
      name: "keyword",
      recursive: false,
      valid: true,
      isActive: false,
      fieldOptions: [
        {
          type: "selectInput",
          isLabeled: true,
          valid: true,
          name: "selected_keywords",
          inLabel: "Title",
          value: "",
          valueArr: [],
          options: [],
        },
        {
          type: "fillinput",
          color: "#005911",
          valid: true,
          isLabeled: true,
          inLabel: "Select keywords",
          name: "selected_keywords",
          sggArray: [],
          valueArr: [],
          value: "",
        },
      ],
    },
    {
      label: "Negative Keywords",
      headerCheckbox: true,
      name: "negative_keyword",
      recursive: false,
      isActive: false,
      valid: true,
      fieldOptions: [
        {
          type: "selectInput",
          isLabeled: true,
          valid: true,
          inLabel: "Title",
          name: "selected_negative_keywords",
          fieldCount: 1,
          sggArray: [],
          valueArr: [],
          value: "",
          options: [],
        },
        {
          type: "fillinput",
          color: "#92000D",
          isLabeled: true,
          valid: true,
          inLabel: "Select keywords",
          sggArray: demo_list,
          fieldCount: 2,
          name: "selected_negative_keywords",
          valueArr: [],
          value: "",
        },
      ],
    },
    {
      label: "Resume from last search",
      headerCheckbox: true,
      name: "resume_last_search",
      recursive: true,
      valid: true,
      isActive: false,
      fieldOptions: [
        {
          type: "input",
          isLabeled: true,
          inLabel: "Your last search member's position",
          name: "resume_last_search_position",
          valid: true,
          value: "",
          // type: "radioSml",
          // isLabeled: false,
          // name: "resume_last_search_position",
          // options: [
          //   {
          //     text: "Yes",
          //     active: true,
          //   },
          //   {
          //     text: "No",
          //     active: false,
          //   },
          // ],
          // fieldOptions: [
          //   {
          //     type: "input",
          //     isLabeled: true,
          //     inLabel: "Your last search member's position",
          //     name: "resume_last_search_position",
          //     value: "",
          //   },
          // ],
        },
      ],
    },
  ],
};
