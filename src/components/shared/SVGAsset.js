import React from "react";

const SVGAsset = (props) => {
  return (
    <>
    {props.type === "warning" && (
      <svg xmlns="http://www.w3.org/2000/svg" fill="#000000" viewBox="0 0 50 50" width="50px" height="50px">    <path d="M25,2C12.297,2,2,12.297,2,25s10.297,23,23,23s23-10.297,23-23S37.703,2,25,2z M25,11c1.657,0,3,1.343,3,3s-1.343,3-3,3 s-3-1.343-3-3S23.343,11,25,11z M29,38h-2h-4h-2v-2h2V23h-2v-2h2h4v2v13h2V38z"/></svg>
    )}
    {props.type === "error" && (
      <svg xmlns="http://www.w3.org/2000/svg" fill="#000000" viewBox="0 0 50 50" width="50px" height="50px"><path d="M25,2C12.319,2,2,12.319,2,25s10.319,23,23,23s23-10.319,23-23S37.681,2,25,2z M33.71,32.29c0.39,0.39,0.39,1.03,0,1.42 C33.51,33.9,33.26,34,33,34s-0.51-0.1-0.71-0.29L25,26.42l-7.29,7.29C17.51,33.9,17.26,34,17,34s-0.51-0.1-0.71-0.29 c-0.39-0.39-0.39-1.03,0-1.42L23.58,25l-7.29-7.29c-0.39-0.39-0.39-1.03,0-1.42c0.39-0.39,1.03-0.39,1.42,0L25,23.58l7.29-7.29 c0.39-0.39,1.03-0.39,1.42,0c0.39,0.39,0.39,1.03,0,1.42L26.42,25L33.71,32.29z"/></svg>
    )}
    {props.type === "success" && (
      <svg xmlns="http://www.w3.org/2000/svg" fill="#000000" viewBox="0 0 50 50" width="50px" height="50px">    <path d="M43.171,10.925L24.085,33.446l-9.667-9.015l1.363-1.463l8.134,7.585L41.861,9.378C37.657,4.844,31.656,2,25,2 C12.317,2,2,12.317,2,25s10.317,23,23,23s23-10.317,23-23C48,19.701,46.194,14.818,43.171,10.925z"/></svg>
    )}
      {props.type === "facebook" && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="24px"
          height="24px"
          className={"ico_svg_" + props.type}
        >
          <path d="M19,3H5C3.895,3,3,3.895,3,5v14c0,1.105,0.895,2,2,2h7.621v-6.961h-2.343v-2.725h2.343V9.309 c0-2.324,1.421-3.591,3.495-3.591c0.699-0.002,1.397,0.034,2.092,0.105v2.43h-1.428c-1.13,0-1.35,0.534-1.35,1.322v1.735h2.7 l-0.351,2.725h-2.365V21H19c1.105,0,2-0.895,2-2V5C21,3.895,20.105,3,19,3z" />
        </svg>
      )}
      {props.type === "messenger" && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="48px"
          height="48px"
          className={"ico_svg_" + props.type}
        >
          <path d="M12,2C6.486,2,2,6.262,2,11.5c0,2.545,1.088,4.988,3,6.772v4.346l4.08-2.039C10.039,20.858,11.02,21,12,21 c5.514,0,10-4.262,10-9.5S17.514,2,12,2z M13.167,14.417l-2.917-2.333L5,14.417l5.833-5.833l2.917,2.333L19,8.583L13.167,14.417z" />
        </svg>
      )}
      {props.type === "back_arrow" && (
        <svg
          height="32px"
          version="1.1"
          viewBox="0 0 32 32"
          width="32px"
          xmlns="http://www.w3.org/2000/svg"
          className={"ico_svg_" + props.type}
        >
          <path d="M28,14H8.8l4.62-4.62C13.814,8.986,14,8.516,14,8c0-0.984-0.813-2-2-2c-0.531,0-0.994,0.193-1.38,0.58l-7.958,7.958  C2.334,14.866,2,15.271,2,16s0.279,1.08,0.646,1.447l7.974,7.973C11.006,25.807,11.469,26,12,26c1.188,0,2-1.016,2-2  c0-0.516-0.186-0.986-0.58-1.38L8.8,18H28c1.104,0,2-0.896,2-2S29.104,14,28,14z" />
        </svg>
      )}
      {props.type === "reaction_like" && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 18 18"
          className={"ico_svg_" + props.type}
        >
          <path
            id="Path_18"
            data-name="Path 18"
            d="M9,0a9,9,0,1,0,6.364,2.636A9,9,0,0,0,9,0Z"
            transform="translate(0 0)"
            fill="#577aff"
          />
          <path
            id="Path_19"
            data-name="Path 19"
            d="M9.9,5.162a.828.828,0,0,1,.365.8.874.874,0,0,1-.512.863.945.945,0,0,1,.1.65,1.139,1.139,0,0,1-.726.821.685.685,0,0,1,.016.738c-.2.351-.374.484-1.143.484H4.862c-1.068,0-1.621-.65-1.621-1.19V5.552c0-1.464,1.585-2.707,1.585-3.725L4.712.559A.582.582,0,0,1,4.775.238.966.966,0,0,1,5.461,0a1.122,1.122,0,0,1,.577.146,2,2,0,0,1,.791,1.835c0,.323-.447,1.289-.508,1.623a9.92,9.92,0,0,1,2.03-.237c1.146-.007,1.89.226,1.89,1a1.655,1.655,0,0,1-.341.793ZM.648,4.76h.864a.62.62,0,0,1,.458.209.752.752,0,0,1,.19.5V10a.753.753,0,0,1-.19.5.62.62,0,0,1-.458.209H.648A.62.62,0,0,1,.19,10.5.753.753,0,0,1,0,10V5.474a.752.752,0,0,1,.19-.5A.62.62,0,0,1,.648,4.76Z"
            transform="translate(3.57 3.124)"
            fill="#fff"
          />
        </svg>
      )}
      {props.type === "reaction_heart" && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18.001"
          viewBox="0 0 18 18.001"
          className={"ico_svg_" + props.type}
        >
          <path
            id="Path_20"
            data-name="Path 20"
            d="M9,0a9,9,0,1,0,6.364,2.636A9,9,0,0,0,9,0Z"
            transform="translate(0 0)"
            fill="#ed001d"
          />
          <path
            id="Path_21"
            data-name="Path 21"
            d="M8.186,0A2.593,2.593,0,0,0,5.477,2.142,2.591,2.591,0,0,0,2.769,0C.453,0-.222,2.609.061,4c.745,3.687,5.416,6.27,5.416,6.27S10.149,7.69,10.894,4C11.176,2.609,10.5,0,8.186,0Z"
            transform="translate(3.523 4.263)"
            fill="#fff"
          />
        </svg>
      )}
      {props.type === "reaction_care" && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 18 18"
          className={"ico_svg_" + props.type}
        >
          <defs>
            <linearGradient
              id="linear-gradient"
              x1="-0.145"
              y1="1.241"
              x2="-0.145"
              y2="1.296"
              gradientUnits="objectBoundingBox"
            >
              <stop offset="0" stopColor="#f28a2d" />
              <stop offset="1" stopColor="#fde86f" />
            </linearGradient>
            <radialGradient
              id="radial-gradient"
              cx="0.5"
              cy="0.5"
              r="0.5"
              gradientUnits="objectBoundingBox"
            >
              <stop offset="0" stopColor="#f28a2d" stopOpacity="0" />
              <stop offset="1" stopColor="#f08423" stopOpacity="0.341" />
            </radialGradient>
            <radialGradient
              id="radial-gradient-2"
              cx="0.108"
              cy="0.52"
              r="0.101"
              gradientUnits="objectBoundingBox"
            >
              <stop offset="0" stopColor="#f28a2d" stopOpacity="0.502" />
              <stop offset="1" stopColor="#f28a2d" stopOpacity="0" />
            </radialGradient>
            <radialGradient
              id="radial-gradient-3"
              cx="0.742"
              cy="0.736"
              r="0.283"
              xlinkHref="#radial-gradient-2"
            />
            <radialGradient
              id="radial-gradient-4"
              cx="0.318"
              cy="0.127"
              r="0.107"
              gradientUnits="objectBoundingBox"
            >
              <stop offset="0" stopColor="#d45f00" stopOpacity="0.149" />
              <stop offset="1" stopColor="#f28a2d" stopOpacity="0" />
            </radialGradient>
            <radialGradient
              id="radial-gradient-5"
              cx="0.681"
              cy="0.134"
              r="0.106"
              gradientUnits="objectBoundingBox"
            >
              <stop offset="0" stopColor="#d45f00" stopOpacity="0.149" />
              <stop offset="1" stopColor="#d45f00" stopOpacity="0" />
            </radialGradient>
            <linearGradient
              id="linear-gradient-2"
              x1="-2.313"
              y1="13.541"
              x2="-2.313"
              y2="11.898"
              gradientUnits="objectBoundingBox"
            >
              <stop offset="0" stopColor="#482314" />
              <stop offset="1" stopColor="#9a4111" />
            </linearGradient>
            <radialGradient
              id="radial-gradient-6"
              cx="0.52"
              cy="0.65"
              r="0.769"
              gradientUnits="objectBoundingBox"
            >
              <stop offset="0" stopColor="#3b446b" />
              <stop offset="0.688" stopColor="#202340" />
            </radialGradient>
            <radialGradient
              id="radial-gradient-7"
              cx="0.458"
              cy="0.649"
              r="0.769"
              xlinkHref="#radial-gradient-6"
            />
            <radialGradient
              id="radial-gradient-8"
              cx="0.478"
              cy="0.399"
              r="0.301"
              gradientUnits="objectBoundingBox"
            >
              <stop offset="0" stopColor="#e38200" />
              <stop offset="1" stopColor="#cd6700" />
            </radialGradient>
            <radialGradient
              id="radial-gradient-9"
              cx="0.501"
              cy="0.259"
              r="0.309"
              xlinkHref="#radial-gradient-8"
            />
            <linearGradient
              id="linear-gradient-3"
              x1="-0.397"
              y1="1.478"
              x2="-0.421"
              y2="1.4"
              gradientUnits="objectBoundingBox"
            >
              <stop offset="0" stopColor="#f34462" />
              <stop offset="1" stopColor="#cc0820" />
            </linearGradient>
            <radialGradient
              id="radial-gradient-10"
              cx="0.736"
              cy="0.444"
              r="0.289"
              gradientUnits="objectBoundingBox"
            >
              <stop offset="0" stopColor="#ff7091" stopOpacity="0.702" />
              <stop offset="1" stopColor="#fe6d8e" stopOpacity="0" />
            </radialGradient>
            <radialGradient
              id="radial-gradient-11"
              cx="0.266"
              cy="0.299"
              r="0.289"
              xlinkHref="#radial-gradient-10"
            />
            <radialGradient
              id="radial-gradient-12"
              cx="0.236"
              cy="0.535"
              r="0.248"
              gradientUnits="objectBoundingBox"
            >
              <stop offset="0" stopColor="#9c0600" />
              <stop offset="1" stopColor="#9c0600" stopOpacity="0" />
            </radialGradient>
            <radialGradient
              id="radial-gradient-13"
              cx="1.001"
              cy="0.56"
              r="0.149"
              gradientUnits="objectBoundingBox"
            >
              <stop offset="0" stopColor="#9c0600" stopOpacity="0.502" />
              <stop offset="1" stopColor="#9c0600" stopOpacity="0" />
            </radialGradient>
            <radialGradient
              id="radial-gradient-14"
              cx="0.038"
              cy="0.244"
              r="0.129"
              xlinkHref="#radial-gradient-13"
            />
            <radialGradient
              id="radial-gradient-15"
              cx="0.746"
              cy="0.771"
              r="0.174"
              xlinkHref="#radial-gradient-12"
            />
            <radialGradient
              id="radial-gradient-16"
              cx="0.02"
              cy="0.038"
              r="1.222"
              gradientUnits="objectBoundingBox"
            >
              <stop offset="0" stopColor="#eda83a" />
              <stop offset="1" stopColor="#ffdc5e" />
            </radialGradient>
            <radialGradient
              id="radial-gradient-17"
              cx="0.945"
              cy="0.048"
              r="1.213"
              xlinkHref="#radial-gradient-16"
            />
          </defs>
          <path
            id="Path_30"
            data-name="Path 30"
            d="M17.63,9a8.935,8.935,0,0,1-8.815,9A8.935,8.935,0,0,1,0,9,8.935,8.935,0,0,1,8.815,0,8.935,8.935,0,0,1,17.63,9Z"
            transform="translate(0.252)"
            fill="url(#linear-gradient)"
          />
          <path
            id="Path_31"
            data-name="Path 31"
            d="M17.63,9a8.935,8.935,0,0,1-8.815,9A8.935,8.935,0,0,1,0,9,8.935,8.935,0,0,1,8.815,0,8.935,8.935,0,0,1,17.63,9Z"
            transform="translate(0.252)"
            fill="url(#radial-gradient)"
          />
          <path
            id="Path_32"
            data-name="Path 32"
            d="M17.63,9a8.935,8.935,0,0,1-8.815,9A8.935,8.935,0,0,1,0,9,8.935,8.935,0,0,1,8.815,0,8.935,8.935,0,0,1,17.63,9Z"
            transform="translate(0.252)"
            fill="url(#radial-gradient-2)"
          />
          <path
            id="Path_33"
            data-name="Path 33"
            d="M17.63,9a8.935,8.935,0,0,1-8.815,9A8.935,8.935,0,0,1,0,9,8.935,8.935,0,0,1,8.815,0,8.935,8.935,0,0,1,17.63,9Z"
            transform="translate(0.252)"
            fill="url(#radial-gradient-3)"
          />
          <path
            id="Path_34"
            data-name="Path 34"
            d="M17.63,9a8.935,8.935,0,0,1-8.815,9A8.935,8.935,0,0,1,0,9,8.935,8.935,0,0,1,8.815,0,8.935,8.935,0,0,1,17.63,9Z"
            transform="translate(0.252)"
            fill="url(#radial-gradient-4)"
          />
          <path
            id="Path_35"
            data-name="Path 35"
            d="M17.63,9a8.935,8.935,0,0,1-8.815,9A8.935,8.935,0,0,1,0,9,8.935,8.935,0,0,1,8.815,0,8.935,8.935,0,0,1,17.63,9Z"
            transform="translate(0.252)"
            fill="url(#radial-gradient-5)"
          />
          <path
            id="Path_36"
            data-name="Path 36"
            d="M4,.264C3.886-.088.129-.088.011.264s.7.822,2,.822S4.12.616,4,.264Z"
            transform="translate(7.055 6.367)"
            fill="url(#linear-gradient-2)"
          />
          <path
            id="Path_37"
            data-name="Path 37"
            d="M2.466,1.644c0,.822-.47,1.057-1.174,1.174S0,2.583,0,1.644C0,.939.352,0,1.291,0,2.113,0,2.466.939,2.466,1.644Z"
            transform="translate(4.497 3.014)"
            fill="url(#radial-gradient-6)"
          />
          <path
            id="Path_38"
            data-name="Path 38"
            d="M.675.088A.409.409,0,0,1,.558.675C.44.793.205.91.088.675a.533.533,0,0,1,0-.587.524.524,0,0,1,.587,0Z"
            transform="translate(4.996 3.396)"
            fill="#4e506a"
          />
          <path
            id="Path_39"
            data-name="Path 39"
            d="M0,1.644C0,2.466.47,2.7,1.291,2.818c.7.117,1.291-.235,1.291-1.174C2.583.939,2.231,0,1.291,0S0,.939,0,1.644Z"
            transform="translate(11.157 3.014)"
            fill="url(#radial-gradient-7)"
          />
          <path
            id="Path_40"
            data-name="Path 40"
            d="M.636.176C.753.294.636.528.518.763a.357.357,0,0,1-.47,0C-.069.646.049.411.166.176.4-.059.518-.059.636.176Z"
            transform="translate(11.748 3.312)"
            fill="#4e506a"
          />
          <path
            id="Path_41"
            data-name="Path 41"
            d="M.095,1.087c-.235.235,0,.587.352.47A6.876,6.876,0,0,1,3.734.97c.352,0,.47,0,.352-.47,0-.352-.47-.587-1.409-.47A4.446,4.446,0,0,0,.095,1.087Z"
            transform="translate(3.831 1.378)"
            fill="url(#radial-gradient-8)"
          />
          <path
            id="Path_42"
            data-name="Path 42"
            d="M1.453.031C.514-.087.044.148.044.5-.073.97.044.97.4.97a6.336,6.336,0,0,1,3.287.587c.47.235.587-.235.352-.47A4.446,4.446,0,0,0,1.453.031Z"
            transform="translate(10.162 1.378)"
            fill="url(#radial-gradient-9)"
          />
          <path
            id="Path_43"
            data-name="Path 43"
            d="M9.408,1.9c-2.466-.7-3.287.939-3.287.939S6.355.956,3.89.134C1.541-.57.132,1.661.015,2.952-.22,5.887,2.363,9.175,3.3,10.349c.117.352.47.352.822.352,1.409-.352,5.4-1.644,6.927-4.227C11.638,5.183,11.756,2.6,9.408,1.9Z"
            transform="translate(2.233 7.299)"
            fill="url(#linear-gradient-3)"
          />
          <path
            id="Path_44"
            data-name="Path 44"
            d="M9.408,1.9c-2.466-.7-3.287.939-3.287.939S6.355.956,3.89.134C1.541-.57.132,1.661.015,2.952-.22,5.887,2.363,9.175,3.3,10.349c.117.352.47.352.822.352,1.409-.352,5.4-1.644,6.927-4.227C11.638,5.183,11.756,2.6,9.408,1.9Z"
            transform="translate(2.233 7.299)"
            fill="url(#radial-gradient-10)"
          />
          <path
            id="Path_45"
            data-name="Path 45"
            d="M9.408,1.9c-2.466-.7-3.287.939-3.287.939S6.355.956,3.89.134C1.541-.57.132,1.661.015,2.952-.22,5.887,2.363,9.175,3.3,10.349c.117.352.47.352.822.352,1.409-.352,5.4-1.644,6.927-4.227C11.638,5.183,11.756,2.6,9.408,1.9Z"
            transform="translate(2.233 7.299)"
            fill="url(#radial-gradient-11)"
          />
          <path
            id="Path_46"
            data-name="Path 46"
            d="M9.408,1.9c-2.466-.7-3.287.939-3.287.939S6.355.956,3.89.134C1.541-.57.132,1.661.015,2.952-.22,5.887,2.363,9.175,3.3,10.349c.117.352.47.352.822.352,1.409-.352,5.4-1.644,6.927-4.227C11.638,5.183,11.756,2.6,9.408,1.9Z"
            transform="translate(2.233 7.299)"
            fill="url(#radial-gradient-12)"
          />
          <path
            id="Path_47"
            data-name="Path 47"
            d="M9.408,1.9c-2.466-.7-3.287.939-3.287.939S6.355.956,3.89.134C1.541-.57.132,1.661.015,2.952-.22,5.887,2.363,9.175,3.3,10.349c.117.352.47.352.822.352,1.409-.352,5.4-1.644,6.927-4.227C11.638,5.183,11.756,2.6,9.408,1.9Z"
            transform="translate(2.233 7.299)"
            fill="url(#radial-gradient-13)"
          />
          <path
            id="Path_48"
            data-name="Path 48"
            d="M9.408,1.9c-2.466-.7-3.287.939-3.287.939S6.355.956,3.89.134C1.541-.57.132,1.661.015,2.952-.22,5.887,2.363,9.175,3.3,10.349c.117.352.47.352.822.352,1.409-.352,5.4-1.644,6.927-4.227C11.638,5.183,11.756,2.6,9.408,1.9Z"
            transform="translate(2.233 7.299)"
            fill="url(#radial-gradient-14)"
          />
          <path
            id="Path_49"
            data-name="Path 49"
            d="M9.408,1.9c-2.466-.7-3.287.939-3.287.939S6.355.956,3.89.134C1.541-.57.132,1.661.015,2.952-.22,5.887,2.363,9.175,3.3,10.349c.117.352.47.352.822.352,1.409-.352,5.4-1.644,6.927-4.227C11.638,5.183,11.756,2.6,9.408,1.9Z"
            transform="translate(2.233 7.299)"
            fill="url(#radial-gradient-15)"
          />
          <path
            id="Path_50"
            data-name="Path 50"
            d="M1.779.514C1.191-.073.135-.425.017.984A4.975,4.975,0,0,0,1.661,4.976C4.949,7.559,7.884,6.15,8,4.271,8.119,2.862,6.357,2.98,5.888,2.98V2.862c.117-.117.352-.235.47-.352.47-.352.235-.939-.352-.822a4.968,4.968,0,0,1-2.466.117C2.6,1.454,2.483,1.1,1.779.514Z"
            transform="translate(0 7.986)"
            fill="url(#radial-gradient-16)"
          />
          <path
            id="Path_51"
            data-name="Path 51"
            d="M7.446.486c.352-.7.939-.47,1.291-.352a1.076,1.076,0,0,1,.822,1.174A6.7,6.7,0,0,1,7.8,6.356C5.1,9.409.519,8.939.049,7.061-.3,5.652,1.34,5.417,1.928,5.417V5.3c-.235-.117-.352-.235-.587-.352-.47-.352-.352-1.057.235-.939a7.988,7.988,0,0,0,2.348.235c2.231-.235,2.583-2,3.522-3.757Z"
            transform="translate(8.441 7.887)"
            fill="url(#radial-gradient-17)"
          />
        </svg>
      )}
      {props.type === "reaction_laugh" && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18.001"
          viewBox="0 0 18 18.001"
          className={"ico_svg_" + props.type}
        >
          <path
            id="Path_52"
            data-name="Path 52"
            d="M18,9a9,9,0,1,1-2.636-6.364A9,9,0,0,1,18,9"
            transform="translate(0 0)"
            fill="#f8c850"
          />
          <path
            id="Path_53"
            data-name="Path 53"
            d="M0,1.183C0,3.549,1.1,8.219,5.478,8.219s5.478-4.669,5.478-7.035C10.955,1,9.192,0,5.478,0S0,1,0,1.183Z"
            transform="translate(3.522 7.434)"
            fill="#50000a"
          />
          <path
            id="Path_54"
            data-name="Path 54"
            d="M0,1.761A4.857,4.857,0,0,0,4.073,3.522,4.832,4.832,0,0,0,8.134,1.761,5.3,5.3,0,0,0,4.073,0,5.335,5.335,0,0,0,0,1.761Z"
            transform="translate(4.939 12.13)"
            fill="#dc2842"
          />
          <path
            id="Path_55"
            data-name="Path 55"
            d="M3.52,1.343a.911.911,0,0,1,.449.925c-.078.3-.213.433-.462.436a6.985,6.985,0,0,0-2.745.719.836.836,0,0,1-.364.1.382.382,0,0,1-.358-.278c-.073-.184-.08-.456.3-.7a6.145,6.145,0,0,1,2.091-.709A7.65,7.65,0,0,0,.993.931C.525.7.576.394.639.226.778-.146,1.306,0,1.82.257a9.745,9.745,0,0,1,1.7,1.086Zm3.919,0A9.7,9.7,0,0,1,9.137.257c.515-.261,1.041-.4,1.181-.031.062.168.114.477-.354.7a7.6,7.6,0,0,0-1.438.9,6.116,6.116,0,0,1,2.089.709c.382.247.375.517.3.7a.381.381,0,0,1-.358.278.836.836,0,0,1-.364-.1A7,7,0,0,0,7.452,2.7c-.25,0-.385-.137-.462-.434a.912.912,0,0,1,.449-.925Z"
            transform="translate(3.522 3.341)"
            fill="#2a3755"
          />
        </svg>
      )}
      {props.type === "reaction_amazed" && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 18 18"
          className={"ico_svg_" + props.type}
        >
          <defs>
            <clipPath id="clip-path">
              <rect
                id="Rectangle_234"
                data-name="Rectangle 234"
                width="18"
                height="18"
                transform="translate(0 -0.494)"
                fill="#fff"
              />
            </clipPath>
          </defs>
          <g id="wow" transform="translate(0 0.494)" clipPath="url(#clip-path)">
            <path
              id="Path_606"
              data-name="Path 606"
              d="M18,9a9,9,0,1,1-2.636-6.364A9,9,0,0,1,18,9"
              transform="translate(0 -0.5)"
              fill="#fdd75a"
            />
            <path
              id="Path_607"
              data-name="Path 607"
              d="M.02,3.249c-.178,2.076.817,3.5,2.652,3.5S5.5,5.325,5.324,3.249,4.069,0,2.672,0,.2,1.172.02,3.249Z"
              transform="translate(6.328 8.5)"
              fill="#50000a"
            />
            <path
              id="Path_608"
              data-name="Path 608"
              d="M0,1.687A1.566,1.566,0,0,1,1.406,0,1.566,1.566,0,0,1,2.813,1.687,1.565,1.565,0,0,1,1.406,3.375,1.565,1.565,0,0,1,0,1.687Zm7.313,0A1.567,1.567,0,0,1,8.719,0a1.566,1.566,0,0,1,1.406,1.687A1.565,1.565,0,0,1,8.719,3.375,1.566,1.566,0,0,1,7.313,1.687Z"
              transform="translate(3.938 4)"
              fill="#fff"
            />
            <path
              id="Path_609"
              data-name="Path 609"
              d="M0,1.687A1.566,1.566,0,0,1,1.406,0,1.566,1.566,0,0,1,2.813,1.687,1.565,1.565,0,0,1,1.406,3.375,1.565,1.565,0,0,1,0,1.687Zm7.313,0A1.567,1.567,0,0,1,8.719,0a1.566,1.566,0,0,1,1.406,1.687A1.565,1.565,0,0,1,8.719,3.375,1.566,1.566,0,0,1,7.313,1.687Z"
              transform="translate(3.938 4)"
            />
            <path
              id="Path_610"
              data-name="Path 610"
              d="M.513.009A.408.408,0,0,1,.774.536a.445.445,0,0,1-.5.358A.409.409,0,0,1,.018.365.445.445,0,0,1,.513.009ZM8,.079a.454.454,0,0,1,.29.585.5.5,0,0,1-.55.4.454.454,0,0,1-.29-.586A.494.494,0,0,1,8,.079Z"
              transform="translate(4.529 4.63)"
              fill="#4e506a"
            />
            <path
              id="Path_611"
              data-name="Path 611"
              d="M8.752.008C8.81,0,8.869,0,8.928,0a2.3,2.3,0,0,1,1.543.632.414.414,0,0,1,.025.574.387.387,0,0,1-.558.027A1.494,1.494,0,0,0,8.822.818a.9.9,0,0,0-.664.372.389.389,0,0,1-.552.076A.414.414,0,0,1,7.531.7,1.676,1.676,0,0,1,8.752.008ZM.128.633A2.3,2.3,0,0,1,1.672,0a1.677,1.677,0,0,1,1.4.7.415.415,0,0,1-.074.57.39.39,0,0,1-.554-.076A.9.9,0,0,0,1.778.818a1.5,1.5,0,0,0-1.116.415A.387.387,0,0,1,.1,1.206.414.414,0,0,1,.128.633Z"
              transform="translate(3.7 1.4)"
            />
            <path
              id="Path_612"
              data-name="Path 612"
              d="M8.752.008C8.81,0,8.869,0,8.928,0a2.3,2.3,0,0,1,1.543.632.414.414,0,0,1,.025.574.387.387,0,0,1-.558.027A1.494,1.494,0,0,0,8.822.818a.9.9,0,0,0-.664.372.389.389,0,0,1-.552.076A.414.414,0,0,1,7.531.7,1.676,1.676,0,0,1,8.752.008ZM.128.633A2.3,2.3,0,0,1,1.672,0a1.677,1.677,0,0,1,1.4.7.415.415,0,0,1-.074.57.39.39,0,0,1-.554-.076A.9.9,0,0,0,1.778.818a1.5,1.5,0,0,0-1.116.415A.387.387,0,0,1,.1,1.206.414.414,0,0,1,.128.633Z"
              transform="translate(3.7 1.4)"
              fill="#e38200"
            />
          </g>
        </svg>
      )}
      {props.type === "reaction_sad" && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 18 18"
          className={"ico_svg_" + props.type}
        >
          <path
            id="Path_56"
            data-name="Path 56"
            d="M18,9a9,9,0,1,1-2.636-6.364A9,9,0,0,1,18,9"
            transform="translate(0 0)"
            fill="#fdd75a"
          />
          <path
            id="Path_57"
            data-name="Path 57"
            d="M0,2.072a.268.268,0,0,0,.294.276,7,7,0,0,1,2.838-.734,6.988,6.988,0,0,1,2.838.734.268.268,0,0,0,.294-.276A3.057,3.057,0,0,0,3.131,0,3.057,3.057,0,0,0,0,2.072Z"
            transform="translate(5.869 12.298)"
            fill="#50000a"
          />
          <path
            id="Path_58"
            data-name="Path 58"
            d="M0,1.721C0,.77.552,0,1.23,0s1.23.77,1.23,1.721A2.186,2.186,0,0,1,2.2,2.776a.54.54,0,0,1-.327.264,2.4,2.4,0,0,1-.645.09,2.41,2.41,0,0,1-.645-.09.538.538,0,0,1-.325-.264A2.175,2.175,0,0,1,0,1.721Zm7.088,0C7.088.77,7.64,0,8.318,0s1.23.77,1.23,1.721A2.186,2.186,0,0,1,9.29,2.776a.562.562,0,0,1-.139.167.515.515,0,0,1-.188.1,2.382,2.382,0,0,1-1.29,0,.515.515,0,0,1-.188-.1.562.562,0,0,1-.139-.167,2.175,2.175,0,0,1-.258-1.054Z"
            transform="translate(4.225 8.179)"
            fill="#fff"
          />
          <path
            id="Path_59"
            data-name="Path 59"
            d="M0,1.721C0,.77.552,0,1.23,0s1.23.77,1.23,1.721A2.186,2.186,0,0,1,2.2,2.776a.54.54,0,0,1-.327.264,2.4,2.4,0,0,1-.645.09,2.41,2.41,0,0,1-.645-.09.538.538,0,0,1-.325-.264A2.175,2.175,0,0,1,0,1.721Zm7.088,0C7.088.77,7.64,0,8.318,0s1.23.77,1.23,1.721A2.186,2.186,0,0,1,9.29,2.776a.562.562,0,0,1-.139.167.515.515,0,0,1-.188.1,2.382,2.382,0,0,1-1.29,0,.515.515,0,0,1-.188-.1.562.562,0,0,1-.139-.167,2.175,2.175,0,0,1-.258-1.054Z"
            transform="translate(4.225 8.179)"
          />
          <path
            id="Path_60"
            data-name="Path 60"
            d="M.625.084a.532.532,0,0,1,.02.647A.339.339,0,0,1,.119.844.532.532,0,0,1,.1.2.34.34,0,0,1,.625.084Zm7.619,0a.533.533,0,0,1,.021.647.341.341,0,0,1-.528.113A.532.532,0,0,1,7.718.2.338.338,0,0,1,8.243.084Z"
            transform="translate(4.434 8.883)"
            fill="#4e506a"
          />
          <path
            id="Path_61"
            data-name="Path 61"
            d="M2.241.257A2.109,2.109,0,0,1,3.128,0a.629.629,0,0,1,.609.359c.194.386.106.471-.219.539A6.907,6.907,0,0,0,.53,2.53C.2,2.859-.122,2.495.047,2.208A5.383,5.383,0,0,1,2.241.257Zm7.014.1A.629.629,0,0,1,9.864,0a2.1,2.1,0,0,1,.887.257,5.369,5.369,0,0,1,2.193,1.951c.169.286-.148.65-.482.322A6.912,6.912,0,0,0,9.473.9C9.148.83,9.062.746,9.255.359Z"
            transform="translate(2.504 5.51)"
            fill="#e38200"
          />
          <path
            id="Path_62"
            data-name="Path 62"
            d="M1.761,6.164A1.87,1.87,0,0,1,0,4.2,5.412,5.412,0,0,1,.755,1.681C1.457.2,1.6,0,1.761,0s.3.2,1.006,1.681A5.412,5.412,0,0,1,3.522,4.2,1.87,1.87,0,0,1,1.761,6.164Z"
            transform="translate(13.304 11.836)"
            fill="#1452ff"
          />
          <path
            id="Path_63"
            data-name="Path 63"
            d="M.7,2.44A.74.74,0,0,1,0,1.665a2.146,2.146,0,0,1,.3-1C.577.08.632,0,.7,0s.121.08.4.665a2.15,2.15,0,0,1,.3,1,.74.74,0,0,1-.7.776"
            transform="translate(14.368 12.75)"
            fill="#7d9fff"
          />
        </svg>
      )}
      {props.type === "reaction_angry" && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18.001"
          viewBox="0 0 18 18.001"
          className={"ico_svg_" + props.type}
        >
          <defs>
            <linearGradient
              id="linear-gradient"
              x1="0.5"
              x2="0.5"
              y2="1"
              gradientUnits="objectBoundingBox"
            >
              <stop offset="0" stopColor="#f18829" />
              <stop offset="1" stopColor="#fdd75a" />
            </linearGradient>
          </defs>
          <path
            id="Path_22"
            data-name="Path 22"
            d="M18,9a9,9,0,1,1-2.636-6.364A9,9,0,0,1,18,9"
            transform="translate(0 0)"
            fill="url(#linear-gradient)"
          />
          <path
            id="Path_23"
            data-name="Path 23"
            d="M0,1.234c0,.62,1.471.521,3.287.521s3.287.1,3.287-.521C6.575.487,5.1,0,3.287,0S0,.487,0,1.234Z"
            transform="translate(5.713 13.891)"
          />
          <path
            id="Path_24"
            data-name="Path 24"
            d="M0,1.234c0,.62,1.471.521,3.287.521s3.287.1,3.287-.521C6.575.487,5.1,0,3.287,0S0,.487,0,1.234Z"
            transform="translate(5.713 13.891)"
            fill="#50000a"
          />
          <path
            id="Path_25"
            data-name="Path 25"
            d="M0,1.68A1.528,1.528,0,0,1,1.3,0,1.527,1.527,0,0,1,2.6,1.68,1.978,1.978,0,0,1,2.33,2.706a.574.574,0,0,1-.345.258,2.76,2.76,0,0,1-.683.088,2.753,2.753,0,0,1-.683-.088.57.57,0,0,1-.345-.258A1.979,1.979,0,0,1,0,1.68Zm6.943,0A1.527,1.527,0,0,1,8.245,0a1.528,1.528,0,0,1,1.3,1.68,1.989,1.989,0,0,1-.273,1.026.57.57,0,0,1-.345.258,2.752,2.752,0,0,1-.683.088,2.76,2.76,0,0,1-.683-.088.576.576,0,0,1-.346-.258A1.988,1.988,0,0,1,6.943,1.68Z"
            transform="translate(4.226 9.371)"
            fill="#fff"
          />
          <path
            id="Path_26"
            data-name="Path 26"
            d="M0,1.68A1.528,1.528,0,0,1,1.3,0,1.527,1.527,0,0,1,2.6,1.68,1.978,1.978,0,0,1,2.33,2.706a.574.574,0,0,1-.345.258,2.76,2.76,0,0,1-.683.088,2.753,2.753,0,0,1-.683-.088.57.57,0,0,1-.345-.258A1.979,1.979,0,0,1,0,1.68Zm6.943,0A1.527,1.527,0,0,1,8.245,0a1.528,1.528,0,0,1,1.3,1.68,1.989,1.989,0,0,1-.273,1.026.57.57,0,0,1-.345.258,2.752,2.752,0,0,1-.683.088,2.76,2.76,0,0,1-.683-.088.576.576,0,0,1-.346-.258A1.988,1.988,0,0,1,6.943,1.68Z"
            transform="translate(4.226 9.371)"
          />
          <path
            id="Path_27"
            data-name="Path 27"
            d="M.916.176A.387.387,0,0,1,.924.259a.448.448,0,0,1-.463.43A.447.447,0,0,1,0,.259.409.409,0,0,1,.094,0C.357.062.633.122.916.176ZM7.873.689A.447.447,0,0,1,7.412.281c.3-.045.606-.1.9-.16a.393.393,0,0,1,.023.14.446.446,0,0,1-.461.429Z"
            transform="translate(4.549 10.314)"
            fill="#4f4f67"
          />
          <path
            id="Path_28"
            data-name="Path 28"
            d="M7.167.7c0-.524.18-.7.491-.7s.457.324.558,1.252A22.932,22.932,0,0,0,11.768.625c.2,0,.305.1.35.313a.4.4,0,0,1-.244.47,11.777,11.777,0,0,1-4.393,1.1c-.185,0-.314-.1-.314-.353Zm-3.254.547C4.014.324,4.162,0,4.471,0s.491.181.491.7V2.152c0,.252-.129.353-.314.353a11.777,11.777,0,0,1-4.393-1.1A.4.4,0,0,1,.011.938C.056.724.165.625.36.625A22.932,22.932,0,0,0,3.913,1.252Z"
            transform="translate(2.935 7.822)"
          />
          <path
            id="Path_29"
            data-name="Path 29"
            d="M7.167.7c0-.524.18-.7.491-.7s.457.324.558,1.252A22.932,22.932,0,0,0,11.768.625c.2,0,.305.1.35.313a.4.4,0,0,1-.244.47,11.777,11.777,0,0,1-4.393,1.1c-.185,0-.314-.1-.314-.353Zm-3.254.547C4.014.324,4.162,0,4.471,0s.491.181.491.7V2.152c0,.252-.129.353-.314.353a11.777,11.777,0,0,1-4.393-1.1A.4.4,0,0,1,.011.938C.056.724.165.625.36.625A22.932,22.932,0,0,0,3.913,1.252Z"
            transform="translate(2.935 7.822)"
            fill="#e38200"
          />
        </svg>
      )}
      {props.type === "comments" && (
        <svg
          id="server"
          xmlns="http://www.w3.org/2000/svg"
          width="9.977"
          height="10.392"
          viewBox="0 0 9.977 10.392"
          className={"ico_svg_" + props.type}
        >
          <rect
            id="Rectangle_115"
            data-name="Rectangle 115"
            width="9.977"
            height="4.157"
            rx="1"
            transform="translate(0 0)"
            fill="#4a018c"
          />
          <rect
            id="Rectangle_116"
            data-name="Rectangle 116"
            width="9.977"
            height="4.157"
            rx="1"
            transform="translate(0 6.235)"
            fill="#4a018c"
          />
        </svg>
      )}
      {props.type === "heart" && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          className={"ico_svg_" + props.type}
        >
          <path d="M12 4.248c-3.148-5.402-12-3.825-12 2.944 0 4.661 5.571 9.427 12 15.808 6.43-6.381 12-11.147 12-15.808 0-6.792-8.875-8.306-12-2.944z" />
        </svg>
      )}
      {props.type === "view-stats" && (
        <svg
          id="Component_46_1"
          data-name="Component 46 – 1"
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 14 14"
          className={"ico_svg_" + props.type}
        >
          <rect
            id="Rectangle_251"
            data-name="Rectangle 251"
            width="14"
            height="14"
            fill="rgba(225,225,225,0)"
          />
          <g id="Group_533" data-name="Group 533" transform="translate(0.553)">
            <g
              id="Rectangle_117"
              data-name="Rectangle 117"
              fill="none"
              stroke="#305670"
              strokeWidth="1"
            >
              <rect width="6" height="8" rx="1.5" stroke="none" />
              <rect x="0.5" y="0.5" width="5" height="7" rx="1" fill="none" />
            </g>
            <g
              id="Rectangle_119"
              data-name="Rectangle 119"
              transform="translate(6.955 5.091)"
              fill="none"
              stroke="#305670"
              strokeWidth="1"
            >
              <rect width="5.939" height="8.909" rx="1.5" stroke="none" />
              <rect
                x="0.5"
                y="0.5"
                width="4.939"
                height="7.909"
                rx="1"
                fill="none"
              />
            </g>
            <g
              id="Rectangle_118"
              data-name="Rectangle 118"
              transform="translate(0 9)"
              fill="none"
              stroke="#305670"
              strokeWidth="1"
            >
              <rect width="6" height="5" rx="1.5" stroke="none" />
              <rect x="0.5" y="0.5" width="5" height="4" rx="1" fill="none" />
            </g>
            <g
              id="Rectangle_120"
              data-name="Rectangle 120"
              transform="translate(6.955)"
              fill="none"
              stroke="#305670"
              strokeWidth="1"
            >
              <rect width="5.939" height="4.242" rx="1.5" stroke="none" />
              <rect
                x="0.5"
                y="0.5"
                width="4.939"
                height="3.242"
                rx="1"
                fill="none"
              />
            </g>
          </g>
        </svg>
      )}

      {props.type === "modes" && (
        <svg
          id="Component_47_1"
          data-name="Component 47 – 1"
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 14 14"
          className={"ico_svg_" + props.type}
        >
          <rect
            id="Rectangle_249"
            data-name="Rectangle 249"
            width="14"
            height="14"
            fill="rgba(225,225,225,0)"
          />
          <g id="grid" transform="translate(0.569 0.569)">
            <rect
              id="Rectangle_144"
              data-name="Rectangle 144"
              width="5"
              height="5"
              rx="1"
              transform="translate(0.431 0.431)"
              fill="none"
              stroke="#305671"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1"
            />
            <rect
              id="Rectangle_145"
              data-name="Rectangle 145"
              width="5"
              height="5"
              rx="1"
              transform="translate(7.431 0.431)"
              fill="#305671"
              stroke="#305671"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1"
            />
            <rect
              id="Rectangle_146"
              data-name="Rectangle 146"
              width="5"
              height="5"
              rx="1"
              transform="translate(7.431 7.431)"
              fill="none"
              stroke="#305671"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1"
            />
            <rect
              id="Rectangle_147"
              data-name="Rectangle 147"
              width="5"
              height="5"
              rx="1"
              transform="translate(0.431 7.431)"
              fill="#305671"
              stroke="#305671"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1"
            />
          </g>
        </svg>
      )}
      {props.type === "logout" && (
        <svg
          id="Component_54_1"
          data-name="Component 54 – 1"
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 14 14"
          className={"ico_svg_" + props.type}
        >
          <rect
            id="Rectangle_252"
            data-name="Rectangle 252"
            width="14"
            height="14"
            fill="rgba(225,225,225,0)"
          />
          <g id="power" transform="translate(-2.133 -2.182)">
            <path
              id="Path_561"
              data-name="Path 561"
              d="M13.424,6.64a5.721,5.721,0,0,1,0,8.311,6.281,6.281,0,0,1-8.639,0,5.721,5.721,0,0,1,0-8.311"
              transform="translate(0 -1.331)"
              fill="none"
              stroke="#305670"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
            />
            <line
              id="Line_92"
              data-name="Line 92"
              y2="6.144"
              transform="translate(9.14 3.024)"
              fill="none"
              stroke="#305670"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
            />
          </g>
        </svg>
      )}

      {props.type === "settings" && (
        <svg
          id="Component_45_12"
          data-name="Component 45 – 12"
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 14 14"
          className={"ico_svg_" + props.type}
        >
          <rect
            id="Rectangle_249"
            data-name="Rectangle 249"
            width="14"
            height="14"
            fill="rgba(225,225,225,0)"
          />
          <g id="settings" transform="translate(0.538 0.544)">
            <circle
              id="Ellipse_23"
              data-name="Ellipse 23"
              cx="1.767"
              cy="1.767"
              r="1.767"
              transform="translate(4.695 4.695)"
              fill="none"
              stroke="#305671"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1"
            />
            <path
              id="Path_88"
              data-name="Path 88"
              d="M11.81,9.225A.969.969,0,0,0,12,10.294l.035.035a1.176,1.176,0,1,1-1.663,1.663l-.035-.035a.977.977,0,0,0-1.657.693v.1a1.175,1.175,0,1,1-2.35,0V12.7A.969.969,0,0,0,5.7,11.81.969.969,0,0,0,4.631,12l-.035.035a1.176,1.176,0,1,1-1.663-1.663l.035-.035a.977.977,0,0,0-.693-1.657h-.1a1.175,1.175,0,1,1,0-2.35h.053A.969.969,0,0,0,3.115,5.7a.969.969,0,0,0-.194-1.069L2.886,4.6A1.176,1.176,0,1,1,4.549,2.933l.035.035a.969.969,0,0,0,1.069.194H5.7a.969.969,0,0,0,.588-.887v-.1a1.175,1.175,0,1,1,2.35,0v.053a.977.977,0,0,0,1.657.693l.035-.035a1.176,1.176,0,1,1,1.663,1.663l-.035.035a.969.969,0,0,0-.194,1.069V5.7a.969.969,0,0,0,.887.588h.1a1.175,1.175,0,1,1,0,2.35H12.7A.969.969,0,0,0,11.81,9.225Z"
              transform="translate(-1 -1)"
              fill="none"
              stroke="#305671"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1"
            />
          </g>
        </svg>
      )}
      {props.type === "lock" && (
        <svg
          id="Component_44_13"
          data-name="Component 44 – 13"
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 14 14"
          className={"ico_svg_" + props.type}
        >
          <rect
            id="Rectangle_249"
            data-name="Rectangle 249"
            width="14"
            height="14"
            fill="rgba(225,225,225,0)"
          />
          <g id="lock" transform="translate(1.341 0.57)">
            <rect
              id="Rectangle_114"
              data-name="Rectangle 114"
              width="11.318"
              height="7.276"
              rx="2"
              transform="translate(0 5.556)"
              fill="none"
              stroke="#305670"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.1"
            />
            <path
              id="Path_85"
              data-name="Path 85"
              d="M7,7.735V5.186a3.186,3.186,0,0,1,6.372,0V7.735"
              transform="translate(-4.527 -2)"
              fill="none"
              stroke="#305670"
              strokeLinejoin="round"
              strokeWidth="1.1"
            />
          </g>
        </svg>
      )}
      {props.type === "change-password" && (
        <svg
          id="Component_43_13"
          data-name="Component 43 – 13"
          xmlns="http://www.w3.org/2000/svg"
          width="14.225"
          height="14"
          viewBox="0 0 14.225 14"
          className={"ico_svg_" + props.type}
        >
          <rect
            id="Rectangle_249"
            data-name="Rectangle 249"
            width="14"
            height="14"
            fill="rgba(225,225,225,0)"
          />
          <g
            id="Group_531"
            data-name="Group 531"
            transform="translate(0.59 0.953)"
          >
            <g id="Group_530" data-name="Group 530">
              <path
                id="Path_84"
                data-name="Path 84"
                d="M11.716,19.375V17.917A2.888,2.888,0,0,0,8.859,15h-5A2.888,2.888,0,0,0,1,17.917v1.458"
                transform="translate(-1 -7.302)"
                fill="none"
                stroke="#305671"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.1"
              />
              <circle
                id="Ellipse_22"
                data-name="Ellipse 22"
                cx="2.625"
                cy="2.625"
                r="2.625"
                transform="translate(2.501)"
                fill="none"
                stroke="#305671"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.1"
              />
            </g>
            <line
              id="Line_23"
              data-name="Line 23"
              x1="3.658"
              transform="translate(10.27 3.45) rotate(45)"
              fill="none"
              stroke="#305671"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.1"
            />
            <line
              id="Line_112"
              data-name="Line 112"
              x1="3.658"
              transform="translate(10.27 6.036) rotate(-45)"
              fill="none"
              stroke="#305671"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.1"
            />
          </g>
        </svg>
      )}
      {props.type === "blacklist-user" && (
        <svg
          id="Component_40_15"
          data-name="Component 40 – 15"
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 14 14"
          className={"ico_svg_" + props.type}
        >
          <rect
            id="Rectangle_249"
            data-name="Rectangle 249"
            width="14"
            height="14"
            fill="rgba(225,225,225,0)"
          />
          <g
            id="Group_531"
            data-name="Group 531"
            transform="translate(0.59 0.953)"
          >
            <g id="Group_530" data-name="Group 530">
              <path
                id="Path_84"
                data-name="Path 84"
                d="M11.716,19.375V17.917A2.888,2.888,0,0,0,8.859,15h-5A2.888,2.888,0,0,0,1,17.917v1.458"
                transform="translate(-1 -7.302)"
                fill="none"
                stroke="#305671"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.1"
              />
              <circle
                id="Ellipse_22"
                data-name="Ellipse 22"
                cx="2.625"
                cy="2.625"
                r="2.625"
                transform="translate(2.501)"
                fill="none"
                stroke="#305671"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.1"
              />
            </g>
            <line
              id="Line_23"
              data-name="Line 23"
              x1="2.558"
              transform="translate(10.284 4.743)"
              fill="none"
              stroke="#305671"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.1"
            />
          </g>
        </svg>
      )}

        {props.type === "external" && (
        <svg
          fill="#305670"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="24px"
          height="24px"
        >
          <path d="M 3 3 L 3 21 L 21 21 L 21 12 L 19 12 L 19 19 L 5 19 L 5 5 L 12 5 L 12 3 L 3 3 z M 14 3 L 14 5 L 17.585938 5 L 8.2929688 14.292969 L 9.7070312 15.707031 L 19 6.4140625 L 19 10 L 21 10 L 21 3 L 14 3 z" />
        </svg>
      )}
    </>
  );
};

export default SVGAsset;
