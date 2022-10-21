import React, { Suspense, useEffect, useState } from "react";

import Loader from "./components/shared/Loader";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";

import Login from "./components/auth/Login";
import ForgotPassword from "./components/auth/ForgotPassword";
import NotFound from "./components/shared/NotFound";
import ChangePassword from "./components/auth/ChangePassword";

const BodyExtension = React.lazy(() =>
  import("./components/dashboard/BodyExtension")
);
const EngagementModes = React.lazy(() =>
  import("./components/dashboard/EngagementModes")
);

const Approutes = (props) => {
  const [loader, setLoader] = useState(true);

  useEffect(() => {
    // console.log('Log state', props.logState);
    setLoader(false);
  }, []);

  return (
    <>
      {loader && <Loader text="Loading..." />}

      <Routes>
        <Route
          path="/"
          element={
            props.logState ? (
              <>
                <Outlet logState={props.logState} />
              </>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        >
          <Route
            index
            element={
              <Suspense fallback={<Loader />}>
                <BodyExtension logState={props.logState} />
              </Suspense>
            }
          />
          <Route
            exact
            path="engagement-modes"
            element={
              props.logState ? (
                <Suspense fallback={<Loader />}>
                  <EngagementModes logState={props.logState} />
                </Suspense>
              ) : (
                <Navigate to="login" replace />
              )
            }
          />
          <Route
            exact
            path="change-password"
            element={
              props.logState ? (
                <Suspense fallback={<Loader />}>
                  <ChangePassword logState={props.logState} />
                </Suspense>
              ) : (
                <Navigate to="login" replace />
              )
            }
          />
          <Route
            element={
              props.logState ? (
                <NotFound logState={props.logState} />
              ) : (
                <Navigate to="login" replace />
              )
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
        <Route
          path="/login"
          element={
            !props.logState ? (
              <>
                <Login logState={props.logState} logDataChange={props.logDataChange} />
              </>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/forgot-password"
          element={
              <>
                <ForgotPassword />
              </>
          }
        />
      </Routes>
    </>
  );
};

export default Approutes;
