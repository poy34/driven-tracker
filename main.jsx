
import React from "react"
import ReactDOM from "react-dom/client"
import Layout from "./Layout"
import "./index.css"
import { Toaster } from "@/components/ui/toaster"

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Layout />
    <Toaster />
  </React.StrictMode>
)
