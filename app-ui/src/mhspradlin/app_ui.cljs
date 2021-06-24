(ns ^:figwheel-hooks mhspradlin.app-ui
  (:require
   [goog.dom :as gdom]
   [reagent.core :as reagent :refer [atom]]
   [reagent.dom :as rdom]))

(println "This text is printed from src/com/mhspradlin/app_ui.cljs. Go ahead and edit it and see reloading in action.")

;; define your app data so that it doesn't get over-written on reload
(defonce app-state (atom {:text "<not yet loaded>"}))

(defn get-app-element []
  (gdom/getElement "app"))

(defn hello-world []
  [:div
   [:h1 "API at /api/hello says:"]
   [:pre (:text @app-state)]
   [:button {:on-click (fn [_] (-> (js/fetch "/api/hello")
                                   (.then (fn [response]
                                            (.info js/console response)
                                            (-> response
                                                .text
                                                (.then (fn [text]
                                                         (reset! app-state {:text text}))))))
                                   (.catch (fn [err]
                                             (.error js/console err)
                                             (reset! app-state {:text err})))))}
    "Click to load"]])

(defn mount [el]
  (rdom/render [hello-world] el))

(defn mount-app-element []
  (when-let [el (get-app-element)]
    (mount el)))

;; conditionally start your application based on the presence of an "app" element
;; this is particularly helpful for testing this ns without launching the app
(mount-app-element)

;; specify reload hook with ^;after-load metadata
(defn ^:after-load on-reload []
  (mount-app-element)
  ;; optionally touch your app-state to force rerendering depending on
  ;; your application
  ;; (swap! app-state update-in [:__figwheel_counter] inc)
  (reset! app-state {:text "<not yet loaded>"}))
