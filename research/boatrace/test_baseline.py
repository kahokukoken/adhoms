"""Synthetic fixtures only; these are correctness tests, NOT market evidence."""
import unittest
from datetime import date
import baseline as b

PROGRAM = '''STARTB
01BBGN
 １Ｒ 一般 Ｈ１８００ｍ 電話投票締切予定１０：３０
1 1001架空甲40石川52A1 6.00 45.00 5.00 30.00 11 40.00 21 30.00
2 1002架空乙30石川52A1 7.00 55.00 5.50 40.00 12 41.00 22 32.00
3 1003架空丙30石川52B1 4.00 25.00 4.00 20.00 13 31.00 23 32.00
4 1004架空丁30石川52B1 4.00 25.00 4.00 20.00 14 31.00 24 32.00
5 1005架空戊30石川52B1 4.00 25.00 4.00 20.00 15 31.00 25 32.00
6 1006架空己30石川52B1 4.00 25.00 4.00 20.00 16 31.00 26 32.00
01BEND
'''
RESULT = '''STARTK
01KBGN
 1R 1-2-3 800 1-2-3 400 1-2 300 1-2 200
 1R 一般 H1800m 晴れ 風 南 2m 波 2cm
01 1 1001 架空甲 11 21 6.80 1 0.10 1.50.0
02 2 1002 架空乙 12 22 6.80 2 0.10 1.51.0
03 3 1003 架空丙 13 23 6.80 3 0.10 1.52.0
04 4 1004 架空丁 14 24 6.80 4 0.10 1.53.0
05 5 1005 架空戊 15 25 6.80 5 0.10 1.54.0
06 6 1006 架空己 16 26 6.80 6 0.10 1.55.0
 単勝 1 150
 ２連単 1-2 300 人気 1
 ２連複 1-2 200 人気 1
 ３連単 1-2-3 800 人気 1
 ３連複 1-2-3 400 人気 1
01KEND
'''
DAY=date(2025,9,1)

class ParserTests(unittest.TestCase):
    def test_program_normalization(self):
        p=b.parse_program(PROGRAM,DAY)
        self.assertEqual(len(p),1)
        r=next(iter(p.values()))
        self.assertEqual(r['close'],'10:30')
        self.assertEqual(len(r['entries']),6)
        self.assertEqual(r['entries'][2]['national_rating'],7.0)
    def test_result_summary_is_not_race(self):
        r=b.parse_results(RESULT,DAY)
        self.assertEqual(len(r),1)
        self.assertEqual(next(iter(r.values()))['payouts']['trifecta'][(1,2,3)],800)
    def test_predictions_use_program_only(self):
        p=next(iter(b.parse_program(PROGRAM,DAY).values()))
        self.assertEqual(b.select(p,'national_rating_win'),('win',(2,)))
        self.assertEqual(b.select(p,'boat1_win'),('win',(1,)))
    def test_settle_without_second_takeout(self):
        r=next(iter(b.parse_results(RESULT,DAY).values()))
        self.assertEqual(b.settle(r,'win',(1,)),150)
        self.assertEqual(b.settle(r,'win',(2,)),0)
    def test_refund_is_not_a_loss(self):
        r=next(iter(b.parse_results(RESULT.replace('02 2 1002','F  2 1002'),DAY).values()))
        self.assertEqual(b.settle(r,'exacta',(1,2)),100)
    def test_disqualification_is_not_refund(self):
        r=next(iter(b.parse_results(RESULT.replace('02 2 1002','S1 2 1002'),DAY).values()))
        self.assertEqual(b.settle(r,'win',(2,)),0)
    def test_unknown_not_mislabeled_loss(self):
        self.assertIsNone(b.settle(None,'win',(1,)))
        self.assertIsNone(b.settle({'entries':{},'payouts':{},'cancelled':False},'win',(1,)))
    def test_dead_heat_payouts_preserved(self):
        r=next(iter(b.parse_results(RESULT.replace('単勝 1 150','単勝 1 150 2 180'),DAY).values()))
        self.assertEqual(b.settle(r,'win',(2,)),180)
    def test_cancellation_returns_stake(self):
        r=next(iter(b.parse_results(RESULT.replace('H1800m 晴れ','H1800m 中止 晴れ'),DAY).values()))
        self.assertEqual(b.settle(r,'trifecta',(1,2,3)),100)
    def test_future_archive_date_rejected(self):
        with self.assertRaises(ValueError):
            b.validate_dates(date(2025,9,1),date(2100,9,1),today=date(2026,9,19))
    def test_day_cap_and_no_reinvestment(self):
        rows=[{'date':'2025-09-01','close':f'10:{i:02d}','race_id':str(i),'payout_yen':2000} for i in range(20)]
        s=b.bankroll(rows,initial=50000)
        self.assertEqual(s['bets'],10)
        self.assertEqual(s['final_bankroll_yen'],69000)
    def test_cash_unknown_is_explicit_scenario(self):
        rows=[{'date':'2025-09-01','close':'10:00','race_id':'x','payout_yen':None}]
        s=b.bankroll(rows)
        self.assertEqual(s['unknown_settlements'],1)
        self.assertEqual(s['final_bankroll_yen'],49900)
        self.assertTrue(s['is_conservative_scenario'])
    def test_roi_definition(self):
        rows=[{'date':'2025-09-01','payout_yen':150},{'date':'2025-09-01','payout_yen':0}]
        s=b.turnover_summary(rows)
        self.assertEqual(s['roi'],-0.25)
        self.assertEqual(s['return_rate'],0.75)

class DailyAuditTests(unittest.TestCase):
    def test_day_policies_and_source_boundary(self):
        rows,audit=b.evaluate_day(PROGRAM,RESULT,DAY)
        self.assertEqual(audit['program_races'],1)
        self.assertEqual(rows['boat1_win'][0]['payout_yen'],150)
        self.assertEqual(rows['national_rating_win'][0]['payout_yen'],0)
        self.assertEqual(rows['fixed12_exacta'][0]['combo'],[1,2])
    def test_racer_mismatch_quarantines_result(self):
        rows,audit=b.evaluate_day(PROGRAM,RESULT.replace('01 1 1001','01 1 9999'),DAY)
        self.assertEqual(len(audit['identity_mismatches']),1)
        self.assertIsNone(rows['boat1_win'][0]['payout_yen'])
    def test_missing_program_race_is_not_removed(self):
        rows,audit=b.evaluate_day(PROGRAM,'STARTK\n01KBGN\n01KEND',DAY)
        self.assertEqual(len(audit['program_only']),1)
        self.assertEqual(len(rows['boat1_win']),1)
        self.assertIsNone(rows['boat1_win'][0]['payout_yen'])

if __name__=='__main__': unittest.main()
