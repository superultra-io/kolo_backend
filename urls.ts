import express, { Router } from 'express';

const router: Router = express.Router({ caseSensitive: true, mergeParams: true, strict: true });

const { protect, protectAdmin } = require('./middleware/auth');

const {
    getUserAuthorization,

    increaseAdsCount,
    getAdsAndTokenCount,

    requestTokenTransfer,

    submitVote,
    getCurrentPoll,
    getCurrentProposals,
    getOneProposal,
} = require('./controller/user');

const {
    addNewProject,
    editProject,
    getProject,
    getProjects,
} = require('./controller/project');

const {
    startPoll,
    closePoll,
    makePayment,
    testPermit
} = require('./controller/admin');

const {
    getRate,
    sendCoin,
} = require('./controller/external');

router.post('/users/auth', getUserAuthorization);

router.post('/projects/', addNewProject);
router.put('/projects/', editProject);
router.post('/projects/one', getProject);
router.post('/projects/all', getProjects);

// router.post('/user', createUser);
router.post('/users/adscount', protect, increaseAdsCount);
router.post('/users/adstokencount', protect, getAdsAndTokenCount);

router.post('/users/token/transfer', protect, requestTokenTransfer);

router.post('/poll/vote', protect, submitVote);

router.post('/admin/startpoll', protectAdmin, startPoll);
router.post('/admin/closepoll', protectAdmin, closePoll);
router.post('/admin/payout', protectAdmin, makePayment);

router.post('/admin/permit', testPermit);


// router.post('/users/poll/current', protect, getCurrentPoll);
// router.post('/users/poll/proposals', protect, getCurrentProposals);
// router.post('/users/poll/proposal', getOneProposal, getCurrentProposals);

router.post('/exchange/rate', getRate);
// router.post('/exchange/coin/send', sendCoin);

export = { router };