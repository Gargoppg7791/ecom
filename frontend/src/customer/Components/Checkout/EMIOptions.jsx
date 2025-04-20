import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Radio,
    RadioGroup,
    FormControlLabel,
    CircularProgress,
    Alert
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const EMIOptions = ({ amount, onEMISelect }) => {
    const [emiPlans, setEmiPlans] = useState({
        credit_card: [],
        debit_card: [],
        cardless: []
    });
    const [selectedEMI, setSelectedEMI] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchEMIPlans = async () => {
            try {
                // Example EMI plans - in production, these would come from Razorpay's API
                const plans = {
                    credit_card: [
                        { bank: 'HDFC Bank', tenures: [3, 6, 9, 12].map(tenure => ({
                            tenure,
                            interest_rate: 14,
                            monthly_installment: Math.round((amount * (1 + 0.14 * tenure/12)) / tenure)
                        }))},
                        { bank: 'ICICI Bank', tenures: [3, 6, 9, 12].map(tenure => ({
                            tenure,
                            interest_rate: 15,
                            monthly_installment: Math.round((amount * (1 + 0.15 * tenure/12)) / tenure)
                        }))},
                    ],
                    debit_card: [
                        { bank: 'HDFC Bank', tenures: [3, 6, 9].map(tenure => ({
                            tenure,
                            interest_rate: 16,
                            monthly_installment: Math.round((amount * (1 + 0.16 * tenure/12)) / tenure)
                        }))},
                    ],
                    cardless: [
                        { provider: 'Bajaj Finserv', tenures: [3, 6, 12].map(tenure => ({
                            tenure,
                            interest_rate: 13,
                            monthly_installment: Math.round((amount * (1 + 0.13 * tenure/12)) / tenure)
                        }))},
                        { provider: 'Capital Float', tenures: [3, 6].map(tenure => ({
                            tenure,
                            interest_rate: 15,
                            monthly_installment: Math.round((amount * (1 + 0.15 * tenure/12)) / tenure)
                        }))},
                    ]
                };
                setEmiPlans(plans);
                setLoading(false);
            } catch (error) {
                setError('Failed to fetch EMI plans. Please try again.');
                setLoading(false);
            }
        };

        if (amount >= 3000) { // Minimum amount for EMI
            fetchEMIPlans();
        } else {
            setError('EMI is available for orders above ₹3,000');
            setLoading(false);
        }
    }, [amount]);

    const handleEMISelect = (emiOption) => {
        setSelectedEMI(emiOption);
        onEMISelect(emiOption);
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" p={2}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Alert severity="info" sx={{ mb: 2 }}>
                {error}
            </Alert>
        );
    }

    return (
        <Box>
            <Typography variant="h6" gutterBottom>
                Available EMI Options
            </Typography>

            <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>Credit Card EMI</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <RadioGroup>
                        {emiPlans.credit_card.map((bank, bankIndex) => (
                            <Box key={bankIndex} mb={2}>
                                <Typography variant="subtitle1" gutterBottom>
                                    {bank.bank}
                                </Typography>
                                {bank.tenures.map((plan, planIndex) => (
                                    <FormControlLabel
                                        key={planIndex}
                                        value={`credit_card_${bank.bank}_${plan.tenure}`}
                                        control={<Radio />}
                                        onChange={() => handleEMISelect({
                                            type: 'credit_card',
                                            bank: bank.bank,
                                            ...plan
                                        })}
                                        label={
                                            <Box>
                                                <Typography variant="body2">
                                                    {plan.tenure} months at {plan.interest_rate}% p.a.
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    ₹{plan.monthly_installment}/month
                                                </Typography>
                                            </Box>
                                        }
                                    />
                                ))}
                            </Box>
                        ))}
                    </RadioGroup>
                </AccordionDetails>
            </Accordion>

            <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>Debit Card EMI</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <RadioGroup>
                        {emiPlans.debit_card.map((bank, bankIndex) => (
                            <Box key={bankIndex} mb={2}>
                                <Typography variant="subtitle1" gutterBottom>
                                    {bank.bank}
                                </Typography>
                                {bank.tenures.map((plan, planIndex) => (
                                    <FormControlLabel
                                        key={planIndex}
                                        value={`debit_card_${bank.bank}_${plan.tenure}`}
                                        control={<Radio />}
                                        onChange={() => handleEMISelect({
                                            type: 'debit_card',
                                            bank: bank.bank,
                                            ...plan
                                        })}
                                        label={
                                            <Box>
                                                <Typography variant="body2">
                                                    {plan.tenure} months at {plan.interest_rate}% p.a.
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    ₹{plan.monthly_installment}/month
                                                </Typography>
                                            </Box>
                                        }
                                    />
                                ))}
                            </Box>
                        ))}
                    </RadioGroup>
                </AccordionDetails>
            </Accordion>

            <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>Cardless EMI</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <RadioGroup>
                        {emiPlans.cardless.map((provider, providerIndex) => (
                            <Box key={providerIndex} mb={2}>
                                <Typography variant="subtitle1" gutterBottom>
                                    {provider.provider}
                                </Typography>
                                {provider.tenures.map((plan, planIndex) => (
                                    <FormControlLabel
                                        key={planIndex}
                                        value={`cardless_${provider.provider}_${plan.tenure}`}
                                        control={<Radio />}
                                        onChange={() => handleEMISelect({
                                            type: 'cardless',
                                            provider: provider.provider,
                                            ...plan
                                        })}
                                        label={
                                            <Box>
                                                <Typography variant="body2">
                                                    {plan.tenure} months at {plan.interest_rate}% p.a.
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    ₹{plan.monthly_installment}/month
                                                </Typography>
                                            </Box>
                                        }
                                    />
                                ))}
                            </Box>
                        ))}
                    </RadioGroup>
                </AccordionDetails>
            </Accordion>
        </Box>
    );
};

export default EMIOptions; 