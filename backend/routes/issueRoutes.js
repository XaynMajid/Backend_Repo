// Submit offer for an issue
router.post('/:issueId/offer', auth, async (req, res) => {
  try {
    const { issueId } = req.params;
    const { price, estimatedTime, notes } = req.body;

    console.log('Submitting offer for issue:', issueId);
    console.log('Offer details:', { price, estimatedTime, notes });
    console.log('Mechanic ID:', req.user.mechanicId);

    // Validate input
    if (!price || !estimatedTime) {
      return res.status(400).json({ message: 'Price and estimated time are required' });
    }

    // Find the issue
    const issue = await Issue.findById(issueId);
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    // Check if mechanic already has an offer for this issue
    const existingOffer = issue.offers.find(offer => offer.mechanic.toString() === req.user.mechanicId);
    if (existingOffer) {
      return res.status(400).json({ message: 'You have already submitted an offer for this issue' });
    }

    // Add the offer
    issue.offers.push({
      mechanic: req.user.mechanicId,
      price,
      estimatedTime,
      notes: notes || '',
      status: 'PENDING'
    });

    // Update issue status
    issue.status = 'OFFERED';
    await issue.save();

    console.log('Offer submitted successfully');

    res.json(issue);
  } catch (err) {
    console.error('Error submitting offer:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Accept mechanic's offer
router.post('/:issueId/accept/:mechanicId', auth, async (req, res) => {
  try {
    const { issueId, mechanicId } = req.params;

    console.log('Accepting offer for issue:', issueId);
    console.log('Mechanic ID:', mechanicId);
    console.log('User ID:', req.user.userId);

    // Find the issue
    const issue = await Issue.findById(issueId);
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    // Verify the issue belongs to the user
    if (issue.user.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to accept offers for this issue' });
    }

    // Find the offer
    const offer = issue.offers.find(o => o.mechanic.toString() === mechanicId);
    if (!offer) {
      return res.status(404).json({ message: 'Offer not found' });
    }

    // Update offer status
    offer.status = 'ACCEPTED';

    // Update other offers to rejected
    issue.offers.forEach(o => {
      if (o.mechanic.toString() !== mechanicId) {
        o.status = 'REJECTED';
      }
    });

    // Update issue status and accepted offer
    issue.status = 'ACCEPTED';
    issue.acceptedOffer = mechanicId;
    await issue.save();

    console.log('Offer accepted successfully');

    res.json(issue);
  } catch (err) {
    console.error('Error accepting offer:', err);
    res.status(500).json({ message: 'Server error' });
  }
}); 