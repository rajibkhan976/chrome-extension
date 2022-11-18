import {React, memo, useCallback, useEffect, useState} from 'react';

import "../../../assets/scss/pages/_messages.scss";

const MessageTabs = ({activeTab,dmfTab,sagementTab,groupTab}) => {


    return (
      <div className="tab-section d-flex-center">
        <div className={(activeTab=== 'dmf') ? "ind-tab active": "ind-tab "} onClick={() => dmfTab()}>
          <span>Dynamic Merge Fields</span>
        </div>
        {/* <div className={(activeTab=== 'sagement') ? "ind-tab active": "ind-tab"} onClick={() => sagementTab()}>
          <span>Segments</span>
        </div>
        <div className={(activeTab=== 'group') ? "ind-tab active": "ind-tab"} onClick={() => groupTab()}>
          <span>Groups</span>
        </div> */}
      </div>
        );
};

export default MessageTabs;