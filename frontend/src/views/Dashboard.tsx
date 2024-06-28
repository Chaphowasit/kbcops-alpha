import * as React from 'react';

import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Divider, PaletteMode, Theme } from '@mui/material';


import DisplayDashboard from '../components/DisplayDashboard';
import getCheckoutTheme from '../assets/getCheckoutTheme';
import DashboardController from '../components/dashboardSidebarComponents/DashboardController';
import DashboardControllerMobile from '../components/dashboardSidebarComponents/DashboardControllerMobile';
import axios from 'axios';

interface DashboardProps {
  theme: Theme;
}

export default function Dashboard({theme}: DashboardProps) {
  const BACKEND_URI = import.meta.env.VITE_BACKEND_URI || "http://127.0.0.1:5000"

  // State variables
  const [selectedFiles, setSelectedFiles] = React.useState<File[]>([]);
  const [fileId, setFileId] = React.useState("");
  const [ontologyList, setOntologyList] = React.useState<string[]>([]);
  const [displayOntoName, setDisplayOntoName] = React.useState<string>("<Ontology>");
  const [displayOntoData, setDisplayOntoData] = React.useState<{
    no_class: number;
    no_individual: number;
    no_axiom: number;
    no_annotation: number;
  }>({ no_class: 0, no_individual: 0, no_axiom: 0, no_annotation: 0 });
  const [displayAlgo, setDisplayAlgo] = React.useState<string>("<Embedding Algorithm>");
  const [displayClassifier, setDisplayClassifier] = React.useState<string>("<classifier>")
  const [displayEvalMetric, setDisplayEvalMetric] = React.useState<{
    mrr: number,
    hit_at_1: number,
    hit_at_5: number,
    hit_at_10: number,
    garbage: number,
    total: number,
    average_garbage_Rank: number,
    average_Rank: number,
  }>({ mrr: 0, hit_at_1: 0, hit_at_5: 0, hit_at_10: 0, garbage: 0, total: 0, average_garbage_Rank: 0, average_Rank: 0 });

  // Types for garbage metrics and images
  type GarbageMetric = {
    Individual: string;
    Predicted: string;
    Predicted_rank: number;
    True: string;
    True_rank: number;
    Score_predict: number;
    Score_true: number;
    Dif: number;
  };
  const [displayGarbageMetric, setDisplayGarbageMetric] = React.useState<GarbageMetric[]>([]);

  type GarbageImage = {
    image: string;
  };
  const [displayGarbageImage, setDisplayGarbageImage] = React.useState<GarbageImage[]>([]);

  // Ref and state for managing the height of the second grid
  const secondGridRef = React.useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = React.useState<number>(0);

  // Fetch the ontology list when the component mounts
  React.useEffect(() => {
    getOntologyList();
  }, []);

  // Effect to update the height of the container
  React.useEffect(() => {
    const updateContainerHeight = () => {
      if (secondGridRef.current) {
        setContainerHeight(secondGridRef.current.scrollHeight);
      }
    };

    // Update height initially and on window resize
    updateContainerHeight();
    window.addEventListener('resize', updateContainerHeight);

    return () => {
      window.removeEventListener('resize', updateContainerHeight);
    };
  }, []);

  // Handle file selection
  const handleFilesSelected = (files: File[]) => {
    setSelectedFiles(files);

    if (files.length > 0) {
      setFileId(files[0].name);
    }
  };

  // Handle file upload
  const handleUpload = () => {
    const file = selectedFiles[0];
    const formData = new FormData();
    formData.append('owl_file', file);
    formData.append('ontology_name', fileId);

    axios.post(`${BACKEND_URI}/api/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
      .then((response) => {
        console.log("Upload successful:", response.data);
        extractOntology(response.data.ontology_name);
      })
      .catch((error) => {
        console.error("Upload failed:", error);
      });
  };

  // Extract ontology data
  const extractOntology = (ontology_name: string) => {
    axios.get(`${BACKEND_URI}/api/extract/${ontology_name}`)
      .then((response) => {
        console.log("Extract successful:", response.data);
        getOntologyList();
        setDisplayOntoName(ontology_name);
        setDisplayOntoData(response.data.onto_data);
      })
      .catch((error) => {
        console.error("Extract failed:", error);
      });
  };

  // Fetch ontology statistics
  const getOntologyStat = (ontology_name: string) => {
    axios.get(`${BACKEND_URI}/api/ontology/${ontology_name}`)
      .then((response) => {
        console.log("Get stat successful:", response.data);
        setDisplayOntoName(ontology_name);
        setDisplayOntoData(response.data.onto_data);
      })
      .catch((error) => {
        console.error("Get stat failed:", error);
      });
  };

  // Fetch the ontology list
  const getOntologyList = () => {
    axios.get(`${BACKEND_URI}/api/ontology`)
      .then((response) => {
        console.log("Load successful:", response.data);
        setOntologyList(response.data.onto_list);
      })
      .catch((error) => {
        console.error("Load failed:", error);
      });
  };

  // Train the embedder
  const trainEmbedder = (ontology_name: string, algorithm: string, classifier: string) => {
    axios.get(`${BACKEND_URI}/api/embed/${ontology_name}?algo=${algorithm}`)
      .then((response) => {
        console.log("Embed successful:", response.data);
        evaluateEmbedder(ontology_name, algorithm, classifier)
      })
      .catch((error) => {
        console.error("Embed failed:", error);
      });
  };

  // Evaluate the embedder
  const evaluateEmbedder = (ontology_name: string, algorithm: string, classifier: string) => {
    axios.get(`${BACKEND_URI}/api/evaluate/${ontology_name}/${algorithm}/${classifier}`)
      .then((response) => {
        console.log("Evaluate successful:", response.data);
        getOntologyStat(ontology_name);
        setDisplayAlgo(algorithm);
        setDisplayClassifier(classifier);
        setDisplayEvalMetric(response.data.performance);
        setDisplayGarbageMetric(response.data.garbage);
        setDisplayGarbageImage(response.data.images);
      })
      .catch((error) => {
        console.error("Evaluate failed:", error);
      });
  };

  // Fetch evaluation statistics
  const getEvaluate = (ontology_name: string, algorithm: string, classifier: string) => {
    if (ontology_name === "" || algorithm === "" || classifier === "") return;

    getOntologyStat(ontology_name);
    setDisplayAlgo(algorithm);
    setDisplayClassifier(classifier)

    axios.get(`${BACKEND_URI}/api/evaluate/${ontology_name}/${algorithm}/${classifier}/stat`)
      .then((response) => {
        console.log("Get evaluate stat successful:", response.data);
        setDisplayEvalMetric(response.data.performance);
        setDisplayGarbageMetric(response.data.garbage);
        setDisplayGarbageImage(response.data.images);
      })
      .catch((error) => {
        console.error("Get evaluate stat failed:", error);
        setDisplayEvalMetric({ mrr: 0, hit_at_1: 0, hit_at_5: 0, hit_at_10: 0, garbage: 0, total: 0, average_garbage_Rank: 0, average_Rank: 0 });
        setDisplayGarbageMetric([]);
        setDisplayGarbageImage([]);
      });
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Grid container sx={{ height: `${containerHeight}px` }}>
        <Grid
          item
          xs={12}
          sm={4}
          lg={3}
          sx={{
            display: { xs: 'none', md: 'flex' },
            flexDirection: 'column',
            backgroundColor: 'background.paper',
            borderRight: { sm: 'none', md: '1px solid' },
            borderColor: { sm: 'none', md: 'divider' },
            alignItems: 'start',
            pt: 4,
            px: 2,
            gap: 4,
            height: "100%",
          }}
        >
          <Box
            mt={"100px"}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              flexGrow: 1,
              width: '100%',
              maxWidth: 500,
            }}
          >
            <DashboardController
              selectedFiles={selectedFiles}
              fileId={fileId}
              setFileId={setFileId}
              handleUpload={handleUpload}
              ontologyList={ontologyList}
              handleFilesSelected={handleFilesSelected}
              trainEmbedder={trainEmbedder}
              getEvaluate={getEvaluate}
            />
          </Box>
        </Grid>
        <Grid
          item
          sm={12}
          md={8}
          lg={9}
          ref={secondGridRef} // Attach the ref to the second grid
          sx={{
            display: 'flex',
            flexDirection: 'column',
            maxWidth: '100%',
            width: '100%',
            backgroundColor: { xs: 'transparent', sm: 'background.default' },
            alignItems: 'start',
            pt: { xs: 2, sm: 4 },
            px: { xs: 2, sm: 10 },
            gap: { xs: 4, md: 8 },
          }}
        >
          <Divider/>

          <Card
            sx={{
              display: { xs: 'flex', md: 'none' },
              width: '100%',
            }}
          >
            <CardContent
              sx={{
                display: 'flex',
                width: '100%',
                alignItems: 'center',
                justifyContent: 'space-between',
                ':last-child': { pb: 2 },
              }}
            >
              <div>
                <Typography variant="subtitle2" gutterBottom>
                  Selected ontology
                </Typography>
                <Typography variant="body1">
                  {ontologyList}
                </Typography>
              </div>
              <DashboardControllerMobile
                selectedFiles={selectedFiles}
                fileId={fileId}
                setFileId={setFileId}
                handleUpload={handleUpload}
                ontologyList={ontologyList}
                handleFilesSelected={handleFilesSelected}
                trainEmbedder={trainEmbedder}
                getEvaluate={getEvaluate} />
            </CardContent>
          </Card>

          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              flexGrow: 1,
              width: '100%',
              maxWidth: { sm: '100%', md: '100%' },
              height: 'auto',
              gap: { xs: 5, md: 'none' },
              pb: 4
            }}
          >
            <DisplayDashboard
              ontology_name={displayOntoName}
              onto_data={displayOntoData}
              algo={displayAlgo}
              classifier={displayClassifier}
              eval_metric={displayEvalMetric}
              garbage_metric={displayGarbageMetric}
              garbage_image={displayGarbageImage}
            />
          </Box>
        </Grid>
      </Grid>
    </ThemeProvider>
  );
}
