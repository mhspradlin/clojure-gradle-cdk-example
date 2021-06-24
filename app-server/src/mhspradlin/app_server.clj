(ns mhspradlin.app-server
  (:gen-class)
  (:require [ring.adapter.jetty :refer [run-jetty]]
            [clojure.tools.logging :refer [infof]]))

(defn handler [request]
  (infof "Got request: %s" request)
  {:status 200
   :headers {"Content-Type" "text/plain"}
   :body "Hello World"})

(defn -main
  [& args]
  (run-jetty handler {:port 3000})) 

(comment
  (-main))
