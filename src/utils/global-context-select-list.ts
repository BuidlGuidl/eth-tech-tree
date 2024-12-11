import {
    createPrompt,
    useState,
    useKeypress,
    usePrefix,
    usePagination,
    useMemo,
    isEnterKey,
    isUpKey,
    isDownKey,
    Separator,
    ValidationError,
    makeTheme,
    type Theme,
} from '@inquirer/core';
import type { PartialDeep } from '@inquirer/type';
import chalk from 'chalk';

type SelectTheme = {
    icon: { cursor: string };
    style: { disabled: (text: string) => string };
};

const selectTheme: SelectTheme = {
    icon: { cursor: '❯' },
    style: { disabled: (text: string) => chalk.dim(`- ${text}`) },
};

type GlobalChoice<Value> = {
    value: Value;
    key: string;
}

type Choice<Value> = {
    value: Value;
    name?: string;
    description?: string;
    disabled?: boolean | string;
    type?: never;
};

type GlobalChoiceSelectConfig<Value> = {
    message: string;
    globalChoices: ReadonlyArray<GlobalChoice<Value>>;
    choices: ReadonlyArray<Choice<Value> | Separator>;
    pageSize?: number;
    loop?: boolean;
    default?: unknown;
    theme?: PartialDeep<Theme<SelectTheme>>;
};

type GlobalChoiceSelectResult<Value> = {
    answer: Value;
}

type Item<Value> = Separator | Choice<Value>;

function isSelectable<Value>(item: Item<Value>): item is Choice<Value> {
    return !Separator.isSeparator(item) && !item.disabled;
}

export default createPrompt(
    <Value>(
        config: GlobalChoiceSelectConfig<Value>, 
        done: (result: GlobalChoiceSelectResult<Value>) => void
    ): string => {
        const { choices: items, loop = true, pageSize = 7 } = config;
        const theme = makeTheme<SelectTheme>(selectTheme, config.theme);
        const prefix = usePrefix({ theme });
        const [status, setStatus] = useState('pending');

        const bounds = useMemo(() => {
            const first = items.findIndex(isSelectable);
            const last = items.findLastIndex(isSelectable);

            if (first < 0) {
                throw new ValidationError(
                    '[select prompt] No selectable choices. All choices are disabled.',
                );
            }

            return { first, last };
        }, [items]);

        const defaultItemIndex = useMemo(() => {
            if (!('default' in config)) return -1;
            return items.findIndex(
                (item) => isSelectable(item) && item.value === config.default,
            );
        }, [config.default, items]);

        const [active, setActive] = useState(
            defaultItemIndex === -1 ? bounds.first : defaultItemIndex,
        );

        // Safe to assume the cursor position always point to a Choice.
        const selectedChoice = items[active] as Choice<Value>;

        useKeypress((key, rl) => {
            // Check for global choices first
            const globalChoice = config.globalChoices.find(choice => {
                if (!!choice.key.length) {
                    return choice.key.includes(key.name);
                } else if (choice.key.includes(",")) {
                    return choice.key.split(",").includes(key.name);
                } else if (choice.key.includes("ctrl+")) {
                    return key.ctrl && key.name === choice.key.split("+")[1];
                }
                return choice.key === key.name;
            });

            if (globalChoice !== undefined) {
                setStatus('done');
                done({
                    answer: globalChoice.value,
                });
                return;
            }

            // Then check for visible choices
            if (isEnterKey(key)) {
                setStatus('done');
                done({
                    answer: selectedChoice.value
                });
            } else if (isUpKey(key) || isDownKey(key)) {
                rl.clearLine(0);
                if (
                    loop ||
                    (isUpKey(key) && active !== bounds.first) ||
                    (isDownKey(key) && active !== bounds.last)
                ) {
                    const offset = isUpKey(key) ? -1 : 1;
                    let next = active;
                    do {
                        next = (next + offset + items.length) % items.length;
                    } while (!isSelectable(items[next]!));
                    setActive(next);
                }
            }
        });

        const message = theme.style.message(config.message, status);

        const page = usePagination<Item<Value>>({
            items,
            active,
            renderItem({ item, isActive }: { item: Item<Value>; isActive: boolean }) {
                if (Separator.isSeparator(item)) {
                    return ` ${item.separator}`;
                }

                const line = item.name || item.value;
                if (item.disabled) {
                    const disabledLabel =
                        typeof item.disabled === 'string' ? item.disabled : '(disabled)';
                    return theme.style.disabled(`${line} ${disabledLabel}`);
                }

                const color = isActive ? theme.style.highlight : (x: string) => x;
                const cursor = isActive ? theme.icon.cursor : ` `;
                return color(`${cursor} ${line}`);
            },
            pageSize,
            loop,
            theme,
        });

        if (status === 'done') {
            if (selectedChoice) {
                const answer =
                    selectedChoice.name ||
                    String(selectedChoice.value);

                return `${prefix} ${message} ${theme.style.answer(answer)}`;
            } else {
                // Hidden action was triggered
                return `${prefix} ${message}`;
            }
        }

        const choiceDescription = selectedChoice?.description
            ? `\n${selectedChoice.description}`
            : ``;

        return `${[prefix, message].filter(Boolean).join(' ')}\n${page}${choiceDescription}${'\x1B[?25l'}`;
    },
);