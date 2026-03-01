<script lang="ts">
    import { Router, Route } from "svelte-routing";
    import Layout from "./components/Layout.svelte";
    import HomePage from "./pages/HomePage.svelte";
    import MagesPage from "./pages/MagesPage.svelte";
    import MageDetailsPage from "./pages/MageDetailsPage.svelte";

    export let url = "";
</script>

<Router {url}>
    <Layout>
        <Route path="/">
            <HomePage />
        </Route>
        <Route path="/mages">
            <MagesPage />
        </Route>
        <Route path="/mages/:id" let:params>
            <MageDetailsPage id={params.id} />
        </Route>
    </Layout>
</Router>
