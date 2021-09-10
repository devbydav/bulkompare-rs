import React from 'react';

import {Stepper, Step, StepButton} from '@mui/material';


const Steps = ({history}) => {

    const steps = [
        {
            title: "Propriétés CSV",
            isComplete: true,
            onClick: () => history.push("/fileProperties"),
        },
        {
            title: "Choix colonnes",
            isSelected: true,
            onClick: () => history.push("/columnSelection"),
        },
    ];


    return (
        <Stepper nonLinear activeStep={0}>
            {steps.map((step, index) => (
                <Step key={step.title} completed={true}>
                    <StepButton color="inherit" onClick={step.onClick}>
                        {step.title}
                    </StepButton>
                </Step>
            ))}
        </Stepper>
    )
}
export default Steps;