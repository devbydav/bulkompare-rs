import React from 'react';
import {useNavigate} from 'react-router-dom';
import {Stepper, Step, StepButton} from '@mui/material';
import CancelIcon from '@mui/icons-material/Cancel';
import WarningRoundedIcon from '@mui/icons-material/WarningRounded';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

import {Status} from "../../constants/constants";


const Steps = ({comparator}) => {
    const navigate = useNavigate();

    const steps = [
        {
            title: "Propriétés CSV",
            disabled: comparator.status < Status.FilesAvailable,
            completed: comparator.status > Status.FilesAvailable,
            onClick: () => navigate("/fileProperties"),
        },
        {
            title: "Choisir colonnes",
            disabled: comparator.status < Status.ColsAvailable,
            completed: comparator.status > Status.ColsAvailable,
            isSelected: false,
            onClick: () => navigate("/columnSelection"),
        },
    ];


    return (
        <Stepper orientation="vertical" nonLinear activeStep={1} sx={{ m: 2 }}>
            {steps.map(step => {
                let buttonIcon;
                if (step.disabled) {
                    buttonIcon = <CancelIcon color={"disabled"}/>
                } else if (step.completed) {
                    buttonIcon = <CheckCircleIcon color={"success"}/>
                } else {
                    buttonIcon = <WarningRoundedIcon color={"warning"}/>
                }

                return (
                    <Step key={step.title} completed={step.completed} disabled={step.disabled}>
                        <StepButton icon={buttonIcon} onClick={step.onClick}>
                            {step.title}
                        </StepButton>
                    </Step>
                )
            })}
        </Stepper>
    )
}
export default Steps;