"""Regression cases; synthetic data, not betting evidence."""
import unittest
import baseline as b
from test_baseline import RESULT, DAY

class PartialVoidTests(unittest.TestCase):
    def test_ticket_specific_void_does_not_cancel_other_types(self):
        text=RESULT.replace('３連単 1-2-3 800 人気 1','３連単 不成立')
        result=next(iter(b.parse_results(text,DAY).values()))
        self.assertEqual(b.settle(result,'win',(1,)),150)
        # The source explicitly voids this pool: repay principal, not unknown.
        self.assertEqual(b.settle(result,'trifecta',(1,2,3)),100)

if __name__=='__main__':
    unittest.main()
