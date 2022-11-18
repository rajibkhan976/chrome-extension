const selectors = {
    group_member_div : ['div[data-visualcompletion="ignore-dynamic"][role="listitem"]:not([sentFR=true]'],
    viewed_group_member_div : ['div[data-visualcompletion="ignore-dynamic"][role="listitem"][sentFR=true]'],
    add_friend_span : ['span[dir="auto"]'],
    tab_index_0 : ['[tabindex="0"]'],
    add_friend_btn : ['div[aria-label="Add Friend"]', 'div[aria-label="Add friend"]'],
    member_anchor : ['a[role="link"][tabindex="-1"]'],
    start_checking : ['div[data-visualcompletion="ignore-dynamic"][role="listitem"][startChecking=true]'],
    friend_count : ['h2[dir="auto"]'],
    logout : ['div[data-visualcompletion="ignore-dynamic"][role="listitem"][data-nocookies="true"]'],
    profile_menu : ['div[aria-label="Your profile"][role="dialog"]'],
    account_controls : ['[aria-label="Account controls and settings"][role="navigation"]', 
                        '[aria-label="Account controls and Settings"][role="navigation"]',
                        '[aria-label="Account Controls and Settings"][role="navigation"]'],
    profile_btn : ['svg[aria-label="Your profile"][data-visualcompletion="ignore-dynamic"][role="img"'],
    group_name : ['h1[dir="auto"], h2[dir="auto"]'],
    main_component : ['div[role="main"]']
}

export default selectors;