const { Thought, User } = require('../models');

module.exports = {
  // Get all thoughts
  async getThoughts(req, res) {
    try {
      const thoughts = await Thought.find(); //finds and returns all thoughts
      res.json(thoughts);
    } catch (err) {
      res.status(500).json(err);
    }
  },
  // Get a thought
  async getSingleThought(req, res) {
    try {
      const thought = await Thought.findOne({ _id: req.params.thoughtId }).select('-__v'); //finds a thought with matching thoughtId in url and returns it
      if (!thought) {
        return res.status(404).json({ message: 'No thought with that ID' });
      }

      res.json(thought);
    } catch (err) {
      res.status(500).json(err);
    }
  },
  // Create a thought
  async createThought(req, res) {
    try {
      const thought = await Thought.create(req.body);//creates thought with body
      await User.findOneAndUpdate(//finds user with matching id
        { _id: req.body.userId },
        { $addToSet: { thoughts: thought._id} },//adds the newly created thought's id to the thoughts array of the user
        { runValidators: true, new: true }
      );
      res.json(thought);
    } catch (err) {
      console.log(err);
      return res.status(500).json(err);
    }
  },
  // Delete a thought
  async deleteThought(req, res) {
    try {
      const thought = await Thought.findOneAndDelete({ _id: req.params.thoughtId });//finds and deletes thought with matching id from url

      await User.findOneAndUpdate(//finds the user with thoughtId in their thoughts array
        { thoughts: req.params.thoughtId },
        { $pull: { thoughts: req.params.thoughtId } },//removes the id from the array
        { new: true }
      );

      if (!thought) {
        res.status(404).json({ message: 'No thought with that ID' });
      }

      res.json({ message: 'Thoughts deleted' });
    } catch (err) {
      res.status(500).json(err);
    }
  },
  // Update a thought
  async updateThought(req, res) {
    try {
      const thought = await Thought.findOneAndUpdate(//finds thought with matching id from url and updates content
        { _id: req.params.thoughtId },
        { $set: req.body },//changes current content to body
        { runValidators: true, new: true }
      );

      if (!thought) {
        res.status(404).json({ message: 'No thought with this id!' });
      }

      res.json(thought);
    } catch (err) {
      res.status(500).json(err);
    }
  },
  // Add a reaction
  async addReaction(req, res) {
    try {
      const thought = await Thought.findOneAndUpdate(//finds thought with matching id from url and adds reaction
        { _id: req.params.thoughtId },
        { $addToSet: { reactions: req.body } },//adds reaction to array
        { runValidators: true, new: true }
      );
      if (!thought) {
        return res.status(404).json({ message: 'No thought with this ID' })
      }
      res.json(thought);
    } catch (err) {
      res.status(500).json(err);
    }
  },
  // Remove a reaction
  async deleteReaction(req, res) {
    try {
      const thought = await Thought.findOneAndUpdate(//finds thought with matching id from url and deletes reaction
        { _id: req.params.thoughtId },
        { $pull: { reactions: { reactionId: req.params.reactionId } } },//removes reaction from array
        { runValidators: true, new: true }
      );

      if (!thought) {
        return res
          .status(404)
          .json({ message: 'No thought with this ID' });
      }

      res.json(thought);
    } catch (err) {
      res.status(500).json(err);
    }
  },
};
