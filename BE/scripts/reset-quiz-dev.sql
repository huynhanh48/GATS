DO $$
DECLARE
	table_names text[];
BEGIN
	SELECT array_agg(format('%I', table_name))
	INTO table_names
	FROM information_schema.tables
	WHERE table_schema = 'public'
		AND table_name = ANY (ARRAY[
			'quiz_answer_options',
			'quiz_answers',
			'quiz_attempts',
			'quiz_options',
			'quiz_accepted_answers',
			'quiz_question_answers',
			'quiz_questions',
			'quizzes'
		]);

	IF table_names IS NOT NULL THEN
		EXECUTE 'TRUNCATE TABLE ' || array_to_string(table_names, ', ') || ' CASCADE';
	END IF;
END $$;
