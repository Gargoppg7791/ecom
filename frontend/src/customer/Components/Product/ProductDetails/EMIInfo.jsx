import React, { useState } from 'react';
import {
    Box,
    Typography,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Tabs,
    Tab
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CreditCardIcon from '@mui/icons-material/CreditCard';

const EMIInfo = ({ price }) => {
    const [selectedBank, setSelectedBank] = useState(0);

    // Bank-specific EMI plans
    const bankEMIPlans = {
        'HDFC Bank': [
            { months: 3, interestRate: 13 },
            { months: 6, interestRate: 14 },
            { months: 9, interestRate: 14.5 },
            { months: 12, interestRate: 15 },
        ],
        'ICICI Bank': [
            { months: 3, interestRate: 12.5 },
            { months: 6, interestRate: 13.5 },
            { months: 9, interestRate: 14 },
            { months: 12, interestRate: 14.5 },
        ],
        'Axis Bank': [
            { months: 3, interestRate: 13.5 },
            { months: 6, interestRate: 14 },
            { months: 9, interestRate: 14.5 },
            { months: 12, interestRate: 15.5 },
        ],
    };

    const banks = Object.keys(bankEMIPlans);

    // Calculate EMI amount
    const calculateEMI = (principal, months, interestRate) => {
        const r = interestRate / (12 * 100);
        const emi = (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
        return Math.round(emi);
    };

    const handleBankChange = (event, newValue) => {
        setSelectedBank(newValue);
    };

    if (price < 3000) {
        return null; // Don't show EMI info for products under ₹3,000
    }

    return (
        <div className="mt-4">
            <Accordion 
                expanded={true} 
                sx={{
                    boxShadow: 'none',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem !important',
                    '&:before': {
                        display: 'none',
                    },
                }}
            >
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    sx={{
                        backgroundColor: '#f9fafb',
                        borderRadius: '0.5rem',
                        '&.Mui-expanded': {
                            borderBottomLeftRadius: 0,
                            borderBottomRightRadius: 0,
                        }
                    }}
                >
                    <div className="flex items-center gap-2">
                        <CreditCardIcon className="text-[#b87d3b]" />
                        <Typography className="font-medium">EMI Available</Typography>
                    </div>
                </AccordionSummary>
                <AccordionDetails>
                    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                        <Tabs
                            value={selectedBank}
                            onChange={handleBankChange}
                            variant="scrollable"
                            scrollButtons="auto"
                            aria-label="bank emi options"
                        >
                            {banks.map((bank, index) => (
                                <Tab key={bank} label={bank} id={`bank-tab-${index}`} />
                            ))}
                        </Tabs>
                    </Box>
                    
                    {banks.map((bank, index) => (
                        <div
                            key={bank}
                            role="tabpanel"
                            hidden={selectedBank !== index}
                            id={`bank-tabpanel-${index}`}
                        >
                            {selectedBank === index && (
                                <Box sx={{ p: 2 }}>
                                    <Typography variant="subtitle2" color="text.secondary" mb={2}>
                                        {bank} EMI Plans
                                    </Typography>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Duration</TableCell>
                                                <TableCell>Interest Rate</TableCell>
                                                <TableCell>Monthly EMI</TableCell>
                                                <TableCell>Total Cost</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {bankEMIPlans[bank].map((plan) => {
                                                const emiAmount = calculateEMI(price, plan.months, plan.interestRate);
                                                const totalCost = emiAmount * plan.months;
                                                
                                                return (
                                                    <TableRow key={plan.months}>
                                                        <TableCell>{plan.months} Months</TableCell>
                                                        <TableCell>{plan.interestRate}%</TableCell>
                                                        <TableCell>₹{emiAmount}</TableCell>
                                                        <TableCell>₹{totalCost}</TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                </Box>
                            )}
                        </div>
                    ))}
                    
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
                        * EMI availability subject to bank approval. Terms and conditions apply.
                    </Typography>
                </AccordionDetails>
            </Accordion>
        </div>
    );
};

export default EMIInfo; 