import { Box, Typography } from "@mui/material";
import { Done } from "@mui/icons-material";

export const ContentStepRegister = () => {
  return (
    <Box>
      <StepBox 
        title="Get Started Quickly"
        desp="Integrate with developer-friendly APIs or choose to use our friendly user interface."
      />
      <StepBox 
        title="Support any business model"
        desp="Re-sale, white-label, travel & tourism, airlines, business users, enterprise, security and more - all within a unified platform."
      />
      <StepBox 
        title="Join the eSIM revolution"
        desp="eSIM Go is trusted by ambitious startups and enterprises of every size."
      />
    </Box>
  )
}

interface StepBoxProps{
  title: string;
  desp:  string;
}

const StepBox = ({
  title,
  desp
}: StepBoxProps) => (
  <Box display='flex' flexDirection='row' paddingBottom={2} >
    <Box pl={0.5}>
      <Box sx={{ height: 24, width: 24, borderRadius: 24 }} fontSize={'18px'} bgcolor='#00AA70' color='white' display='flex' alignItems='center' justifyContent='center'>
        <Done color='inherit'fontSize='inherit' />
      </Box>
    </Box>
    <Box flex={1} pl={1}>
      <Typography mb={1} component='h1' fontWeight='500' >
       { title }
      </Typography>
      <Typography component='p' variant='body2' className="text-textDark" fontWeight='300' >
       { desp }
      </Typography>
    </Box>
  </Box>
);
