"""Regression fixtures for official K archive formats; not market evidence."""
import unittest
import baseline as b
from test_baseline import RESULT, DAY


def parsed(text):
    return next(iter(b.parse_results(text, DAY).values()))


class SpecialSettlementTests(unittest.TestCase):
    def test_void_summary_does_not_create_a_race(self):
        text = RESULT.replace('1R 1-2-3 800 1-2-3 400 1-2 300 1-2 200',
                              '1R 不成立 不成立 1-2 300 1-2 200')
        self.assertEqual(len(b.parse_results(text, DAY)), 1)

    def test_special_payout_applies_to_nonrefunded_ticket(self):
        r = parsed(RESULT.replace('単勝 1 150', '単勝 特払い 70'))
        self.assertEqual(b.settle(r, 'win', (2,)), 70)

    def test_special_payout_is_not_win_and_not_full_refund(self):
        r = parsed(RESULT.replace('単勝 1 150', '単勝 特払い 70'))
        self.assertEqual(b.settlement(r, 'win', (2,)), (70, 'special_payout'))

    def test_refund_precedes_special_payout(self):
        r = parsed(RESULT.replace('単勝 1 150', '単勝 特払い 70')
                         .replace('02 2 1002', 'F 2 1002'))
        self.assertEqual(b.settle(r, 'win', (2,)), 100)

    def test_void_pool_does_not_void_other_pools(self):
        r = parsed(RESULT.replace('３連単 1-2-3 800 人気 1', '３連単 不成立'))
        self.assertEqual(b.settle(r, 'trifecta', (1, 2, 3)), 100)
        self.assertEqual(b.settle(r, 'exacta', (1, 2)), 300)
        self.assertEqual(b.settle(r, 'exacta', (2, 1)), 0)
        self.assertFalse(r['cancelled'])

    def test_void_pool_without_finishers_is_a_known_refund(self):
        r = {'cancelled': False, 'entries': {}, 'payouts': {}, 'pool_status': {'trio': 'void'}}
        self.assertEqual(b.settle(r, 'trio', (1, 2, 3)), 100)

    def test_malformed_special_amount_is_not_guessed(self):
        with self.assertRaises(ValueError):
            parsed(RESULT.replace('単勝 1 150', '単勝 特払い 未確定'))

    def test_special_and_regular_payout_conflict_is_rejected(self):
        with self.assertRaises(ValueError):
            parsed(RESULT.replace('単勝 1 150', '単勝 特払い 70\n 単勝 1 150'))

    def test_identical_real_headers_still_rejected(self):
        with self.assertRaises(ValueError):
            b.parse_results(RESULT.replace('01KEND', ' 1R 一般 H1800m\n01KEND'), DAY)

    def test_bankroll_preserves_special_amount(self):
        r = parsed(RESULT.replace('単勝 1 150', '単勝 特払い 70'))
        rows = [{'date': '2025-09-01', 'close': '10:00', 'race_id': '1',
                 'payout_yen': b.settle(r, 'win', (2,))}]
        self.assertEqual(b.bankroll(rows)['final_bankroll_yen'], 49970)


class CancelledBodyTests(unittest.TestCase):
    def test_body_cancellation_refunds_every_ticket(self):
        text = RESULT.replace(' 単勝 1 150', ' レース不成立\n 単勝 1 150')
        self.assertEqual(b.settle(parsed(text), 'exacta', (2, 1)), 100)

    def test_zero_finish_status_preserves_identity(self):
        r = parsed(RESULT.replace('02 2 1002', '00 2 1002')
                         .replace(' 単勝 1 150', ' レース不成立\n 単勝 1 150'))
        self.assertEqual(r['entries'][2]['racer_id'], 1002)
        self.assertEqual(b.settle(r, 'win', (2,)), 100)


if __name__ == '__main__':
    unittest.main()
