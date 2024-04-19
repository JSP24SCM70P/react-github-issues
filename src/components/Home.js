/*
Goal of React:
  1. React will retrieve GitHub created and closed issues for a given repository and will display the bar-charts 
     of same using high-charts        
  2. It will also display the images of the forecasted data for the given GitHub repository and images are being retrieved from 
     Google Cloud storage
  3. React will make a fetch api call to flask microservice.
*/

// Import required libraries
import * as React from "react";
import { useState } from "react";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import AppBar from "@mui/material/AppBar";
import CssBaseline from "@mui/material/CssBaseline";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
// Import custom components
import BarCharts from "./BarCharts";
import Loader from "./Loader";
import { ListItemButton } from "@mui/material";

const drawerWidth = 240;
// List of GitHub repositories 
const repositories = [
  {
    key: "openai/openai-cookbook",
    value: "OpenAI cookbook",
  },
  {
    key: "elastic/elasticsearch",
    value: "Elastic search",
  },
  {
    key: "openai/openai-python",
    value: "OpenAI python",
  },
  {
    key: "milvus-io/pymilvus",
    value: "pymilvus"
  },
  {
    key: "sebholstein/angular-google-maps",
    value: "sebastianM",
  },
  {
    key: "openai/openai-cookbook elastic/elasticsearch openai/openai-python milvus-io/pymilvus sebholstein/angular-google-maps",
    value: "Star count of all repos"
  },
  {
    key: "openai/openai-cookbook$elastic/elasticsearch$openai/openai-python$milvus-io/pymilvus$sebholstein/angular-google-maps",
    value: "Fork count of all repos"
  }
];

export default function Home() {
  /*
  The useState is a react hook which is special function that takes the initial 
  state as an argument and returns an array of two entries. 
  */
  /*
  setLoading is a function that sets loading to true when we trigger flask microservice
  If loading is true, we render a loader else render the Bar charts
  */
  const [loading, setLoading] = useState(true);
  /* 
  setRepository is a function that will update the user's selected repository such as Angular,
  Angular-cli, Material Design, and D3
  The repository "key" will be sent to flask microservice in a request body
  */
  const [repository, setRepository] = useState({
    key: "openai/openai-cookbook",
    value: "OpenAI cookbook",
  });

  const [starsFlag, setStarsFlag] = useState(false);
  const [forksFlag, setForksFlag] = useState(false);

  /*
  
  The first element is the initial state (i.e. githubRepoData) and the second one is a function 
  (i.e. setGithubData) which is used for updating the state.

  so, setGitHub data is a function that takes the response from the flask microservice 
  and updates the value of gitHubrepo data.
  */
  const [githubRepoData, setGithubData] = useState([]);
  // Updates the repository to newly selected repository
  const eventHandler = (repo) => {
    setRepository(repo);
  };

  /* 
  Fetch the data from flask microservice on Component load and on update of new repository.
  Everytime there is a change in a repository, useEffect will get triggered, useEffect inturn will trigger 
  the flask microservice 
  */
  React.useEffect(() => {
    // set loading to true to display loader
    setLoading(true);
    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      // Append the repository key to request body
      body: JSON.stringify({ repository: repository.key, starlist_status: starsFlag, forklist_status: forksFlag }),
    };

    /*
    Fetching the GitHub details from flask microservice
    The route "/api/github" is served by Flask/App.py in the line 53
    @app.route('/api/github', methods=['POST'])
    Which is routed by setupProxy.js to the
    microservice target: "your_flask_gcloud_url"
    */

    fetch("/api/github", requestOptions)
      .then((res) => res.json())
      .then(
        // On successful response from flask microservice
        (result) => {
          // On success set loading to false to display the contents of the resonse
          setLoading(false);
          // Set state on successfull response from the API
          setGithubData(result);
        },
        // On failure from flask microservice
        (error) => {
          // Set state on failure response from the API
          console.log(error);
          // On failure set loading to false to display the error message
          setLoading(false);
          setGithubData([]);
        }
      );


  }, [repository]);

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      {/* Application Header */}
      <AppBar
        position="fixed"
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
      >
        <Toolbar>
          <Typography variant="h6" noWrap component="div">
            Timeseries Forecasting
          </Typography>
        </Toolbar>
      </AppBar>
      {/* Left drawer of the application */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: "border-box",
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: "auto" }}>
          <List>
            {/* Iterate through the repositories list */}
            {repositories.map((repo) => (
              <ListItem
                button
                key={repo.key}
                onClick={() => {
                  if (repo.value.toLowerCase() === "Star count of all repos".toLowerCase()) {
                    setStarsFlag(true);
                    setForksFlag(false);
                    //setActiveButton(repo.value);
                  }
                  else if(repo.value.toLowerCase() === "Fork count of all repos".toLowerCase()){
                    
                    //setActiveButton(repo.value);
                    setForksFlag(true);
                    setStarsFlag(false);

                  }
                  else{
                    setStarsFlag(false);
                    setForksFlag(false);
                  }
                  eventHandler(repo);
                }}
                disabled={loading && repo.value !== repository.value}
              >
                <ListItemButton selected={repo.value === repository.value}>
                  <ListItemText primary={repo.value} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        {/* Render loader component if loading is true else render charts and images */}
        {loading ? (
          <Loader />
        ) : (
          <div>
            {/* Render barchart component for a monthly created issues for a selected repositories*/}
            {!starsFlag && !forksFlag && <BarCharts
              title={`Monthly Created Issues for ${repository.value} in last 1 year`}
              yaxisText={'Issues'} tooltipText={'Issues'}
              data={githubRepoData?.created}
            />}
            {/* Render barchart component for a monthly created issues for a selected repositories*/}
            {!starsFlag && !forksFlag && <BarCharts
              title={`Monthly Closed Issues for ${repository.value} in last 1 year`}
              yaxisText={'Issues'} tooltipText={'Issues'}
              data={githubRepoData?.closed}
            />}
            
            {!starsFlag && !forksFlag && (<><div>
                <Typography component="h4">
                  The day of the week maximum number of issues created
                </Typography>
                {/* render the image of The day of the week maximum number of issues created */}
                <img
                  src={githubRepoData?.createdAtImageUrls?.created_issues_max_day}
                  alt={"Image for The day of the week maximum number of issues created "}
                  loading={"lazy"} />
              </div><div>
                  <Typography component="h4">
                    The day of the week maximum number of issues closed
                  </Typography>
                  {/* render the image of The day of the week maximum number of issues closed*/}
                  <img
                    src={githubRepoData?.createdAtImageUrls?.closed_issues_max_day}
                    alt={"Image for The day of the week maximum number of issues closed"}
                    loading={"lazy"} />
                </div>
                <div>
                  <Typography component="h4">
                  The month of the year that has maximum number of issues closed
                  </Typography>
                  {/* render the image of The month of the year that has maximum number of issues closed*/}
                  <img
                    src={githubRepoData?.createdAtImageUrls?.closed_issues_max_month}
                    alt={"Image for The month of the year that has maximum number of issues closed"}
                    loading={"lazy"} />
                </div>
                </>)}
            <Divider
              sx={{ borderBlockWidth: "3px", borderBlockColor: "#FFA500" }}
            />
            {/* Rendering Timeseries Forecasting of Created Issues using Tensorflow and
                Keras LSTM */}
            {!starsFlag && !forksFlag && (<div>
              <Typography variant="h5" component="div" gutterBottom>
                Timeseries Forecasting of Created Issues using Tensorflow and
                Keras LSTM based on past month
              </Typography>

              
              <div>
                <Typography component="h4">
                  Model Loss for Created Issues
                </Typography>
                {/* Render the model loss image for created issues */}
                <img
                  src={githubRepoData?.createdAtImageUrls?.model_loss_image_url}
                  alt={"Model Loss for Created Issues"}
                  loading={"lazy"}
                />
              </div>
              <div>
                <Typography component="h4">
                  LSTM Generated Data for Created Issues
                </Typography>
                {/* Render the LSTM generated image for created issues*/}
                <img
                  src={
                    githubRepoData?.createdAtImageUrls?.lstm_generated_image_url
                  }
                  alt={"LSTM Generated Data for Created Issues"}
                  loading={"lazy"}
                />
              </div>
              <div>
                <Typography component="h4">
                  All Issues Data for Created Issues
                </Typography>
                {/* Render the all issues data image for created issues*/}
                <img
                  src={
                    githubRepoData?.createdAtImageUrls?.all_issues_data_image
                  }
                  alt={"All Issues Data for Created Issues"}
                  loading={"lazy"}
                />
              </div>
            </div>)}
            {/* Rendering Timeseries Forecasting of Closed Issues using Tensorflow and
                Keras LSTM  */}
            {!starsFlag && !forksFlag && (<div>
              <Divider
                sx={{ borderBlockWidth: "3px", borderBlockColor: "#FFA500" }}
              />
              <Typography variant="h5" component="div" gutterBottom>
                Timeseries Forecasting of Closed Issues using Tensorflow and
                Keras LSTM based on past month
              </Typography>

              <div>
                <Typography component="h4">
                  Model Loss for Closed Issues
                </Typography>
                {/* Render the model loss image for closed issues  */}
                <img
                  src={githubRepoData?.closedAtImageUrls?.model_loss_image_url}
                  alt={"Model Loss for Closed Issues"}
                  loading={"lazy"}
                />
              </div>
              <div>
                <Typography component="h4">
                  LSTM Generated Data for Closed Issues
                </Typography>
                {/* Render the LSTM generated image for closed issues */}
                <img
                  src={
                    githubRepoData?.closedAtImageUrls?.lstm_generated_image_url
                  }
                  alt={"LSTM Generated Data for Closed Issues"}
                  loading={"lazy"}
                />
              </div>
              <div>
                <Typography component="h4">
                  All Issues Data for Closed Issues
                </Typography>
                {/* Render the all issues data image for closed issues*/}
                <img
                  src={githubRepoData?.closedAtImageUrls?.all_issues_data_image}
                  alt={"All Issues Data for Closed Issues"}
                  loading={"lazy"}
                />
              </div>
            </div>)}

            <Divider
              sx={{ borderBlockWidth: "3px", borderBlockColor: "#FFA500" }}
            />
            {/* Rendering Timeseries Forecasting of Pull Issues using Tensorflow and
                Keras LSTM */}
            {!starsFlag && !forksFlag && (<div>
              <Typography variant="h5" component="div" gutterBottom>
                Timeseries Forecasting of Pull Issues using Tensorflow and
                Keras LSTM based on past month
              </Typography>

              
              <div>
                <Typography component="h4">
                  Model Loss for Pull Issues
                </Typography>
                {/* Render the model loss image for pull issues */}
                <img
                  src={githubRepoData?.pulledAtImageUrls?.model_loss_image_url}
                  alt={"Model Loss for pull Issues"}
                  loading={"lazy"}
                />
              </div>
              <div>
                <Typography component="h4">
                  LSTM Generated Data for pull requests
                </Typography>
                {/* Render the LSTM generated image for pull issues*/}
                <img
                  src={
                    githubRepoData?.pulledAtImageUrls?.lstm_generated_image_url
                  }
                  alt={"LSTM Generated Data for pull Issues"}
                  loading={"lazy"}
                />
              </div>
              <div>
                <Typography component="h4">
                  All Issues Data for Pull Requests
                </Typography>
                {/* Render the all issues data image for created issues*/}
                <img
                  src={
                    githubRepoData?.pulledAtImageUrls?.all_issues_data_image
                  }
                  alt={"All Issues Data for pull requests"}
                  loading={"lazy"}
                />
              </div>
            </div>)}

            {starsFlag && !forksFlag && <BarCharts
              title={`Star count of every repo`}
              yaxisText={'Stars'} tooltipText={'Stars'}
              data={githubRepoData?.starsCount}
            />}

{!starsFlag && forksFlag && <BarCharts
              title={`Fork count of every repo`}
              yaxisText={'Forks'} tooltipText={'Forks'}
              data={githubRepoData?.forksCount}
            />}
          </div>
        )}


      </Box>
    </Box>
  );
}
